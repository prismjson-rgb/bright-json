/** Bounded local snapshots. A transform always creates its own undo step. */
export interface JsonHistory {
  past: string[];
  future: string[];
  typingAt: number | null;
}
export const emptyHistory = (): JsonHistory => ({ past: [], future: [], typingAt: null });
const MAX_STEPS = 50;
const MAX_CHARS = 8_000_000;
function bounded(values: string[]): string[] {
  const result = values.slice(-MAX_STEPS);
  let chars = result.reduce((sum, value) => sum + value.length, 0);
  while (result.length > 1 && chars > MAX_CHARS) chars -= result.shift()!.length;
  return result;
}
/** Older tabs have no history. Invalid optional history must not hide their JSON. */
export function restoreHistory(value: unknown): JsonHistory {
  if (!value || typeof value !== "object") return emptyHistory();
  const stored = value as Partial<JsonHistory>;
  const stack = (items: unknown) => Array.isArray(items)
    ? bounded(items.filter((item): item is string => typeof item === "string")) : [];
  return { past: stack(stored.past), future: stack(stored.future), typingAt: null };
}
export function recordChange(history: JsonHistory, before: string, after: string, typing = false, now = Date.now()): JsonHistory {
  if (before === after) return history;
  const grouped = typing && history.typingAt !== null && now - history.typingAt < 750 && history.future.length === 0;
  return { past: grouped ? history.past : bounded([...history.past, before]), future: [], typingAt: typing ? now : null };
}
export function travelHistory(history: JsonHistory, current: string, direction: "undo" | "redo"): { history: JsonHistory; value: string } {
  const source = direction === "undo" ? history.past : history.future;
  if (!source.length) return { history, value: current };
  const value = source[source.length - 1];
  return { value, history: direction === "undo"
    ? { past: history.past.slice(0, -1), future: bounded([...history.future, current]), typingAt: null }
    : { past: bounded([...history.past, current]), future: history.future.slice(0, -1), typingAt: null } };
}
