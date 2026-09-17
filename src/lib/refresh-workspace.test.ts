import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { saveTabs, type TabsState } from "./tabs-storage";
import { refreshWorkspace } from "./refresh-workspace";

vi.mock("./tabs-storage", () => ({ saveTabs: vi.fn() }));
const initial: TabsState = { tabs: [{ id: "1", name: "Draft", json: "{", notes: { type: "doc" } }], activeId: "1" };
let current = initial;
const reload = vi.fn();
const replaceState = vi.fn();
const saved = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  current = initial;
  vi.mocked(saveTabs).mockResolvedValue();
  vi.stubGlobal("window", {
    location: { hash: "#json=original", pathname: "/", search: "?tool=json-formatter", reload },
    history: { state: { preserved: true }, replaceState },
  });
});
afterEach(() => vi.unstubAllGlobals());

it("waits for a successful save, including invalid drafts and notes, before reloading", async () => {
  let finish!: () => void;
  vi.mocked(saveTabs).mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  const pending = refreshWorkspace(() => current, saved);
  expect(reload).not.toHaveBeenCalled();
  finish();
  await pending;
  expect(saveTabs).toHaveBeenCalledWith(initial);
  expect(saved).toHaveBeenCalledWith(initial);
  expect(replaceState).toHaveBeenCalledWith({ preserved: true }, "", "/?tool=json-formatter");
  expect(reload).toHaveBeenCalledOnce();
});

it("does not reload or alter the URL if saving fails", async () => {
  vi.mocked(saveTabs).mockRejectedValue(new Error("Storage full"));
  await expect(refreshWorkspace(() => current, saved)).rejects.toThrow("Storage full");
  expect(reload).not.toHaveBeenCalled();
  expect(replaceState).not.toHaveBeenCalled();
});

it("does not reload if the user edits while the save is pending", async () => {
  vi.mocked(saveTabs).mockImplementation(async () => { current = { ...initial, activeId: "2" }; });
  await expect(refreshWorkspace(() => current, saved)).rejects.toThrow("changed while saving");
  expect(reload).not.toHaveBeenCalled();
});

it("preserves ordinary anchor fragments", async () => {
  window.location.hash = "#examples";
  await refreshWorkspace(() => current, saved);
  expect(replaceState).not.toHaveBeenCalled();
  expect(reload).toHaveBeenCalledOnce();
});
