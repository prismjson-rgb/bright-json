import { describe, expect, it } from "vitest";
import { emptyHistory, recordChange, restoreHistory, travelHistory } from "./json-history";

describe("JSON undo history", () => {
  it("restores both stacks across serialization without merging typing across refresh", () => {
    const history = recordChange(emptyHistory(), "original", "edited", true, 100);
    const undone = travelHistory(history, "edited", "undo");
    const restored = restoreHistory(JSON.parse(JSON.stringify(undone.history)));
    expect(travelHistory(restored, undone.value, "redo").value).toBe("edited");
    expect(restoreHistory(history).typingAt).toBeNull();
    expect(restoreHistory(undefined)).toEqual(emptyHistory());
    expect(restoreHistory({ past: [null, 5, "safe"], future: "bad" })).toEqual({ past: ["safe"], future: [], typingAt: null });
  });
  it("restores exact malformed input and redoes a repair", () => {
    const original = "{'x':9007199254740993,}";
    const repaired = '{"x":9007199254740993}';
    const undo = travelHistory(recordChange(emptyHistory(), original, repaired), repaired, "undo");
    expect(undo.value).toBe(original);
    expect(travelHistory(undo.history, undo.value, "redo").value).toBe(repaired);
  });
  it("groups typing but keeps transforms separate", () => {
    let history = recordChange(emptyHistory(), "", "a", true, 0);
    history = recordChange(history, "a", "ab", true, 100);
    history = recordChange(history, "ab", '"ab"', false, 200);
    const undo = travelHistory(history, '"ab"', "undo");
    expect(undo.value).toBe("ab");
    expect(travelHistory(undo.history, "ab", "undo").value).toBe("");
  });
  it("clears redo after a new edit, ignores unchanged input, and bounds history", () => {
    let history = emptyHistory();
    for (let i = 0; i < 100; i++) history = recordChange(history, String(i), String(i + 1));
    expect(history.past).toHaveLength(50);
    expect(recordChange(history, "100", "100")).toBe(history);
    const undo = travelHistory(history, "100", "undo");
    expect(recordChange(undo.history, undo.value, "new").future).toEqual([]);
  });
});
