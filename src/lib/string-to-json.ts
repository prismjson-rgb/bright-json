/**
 * Reverses jsonToString: takes a pasted escaped JSON string (with or without
 * surrounding quotes) and recovers the pretty-printed JSON it represents.
 */
import { formatJsonPrecisely } from "./precise-json";
import { assertInputBudget } from "./input-limits";
export function stringToJson(input: string): { json: string | null; error: string | null } {
  try { assertInputBudget(input); } catch (error) { return { json: null, error: (error as Error).message }; }
  const trimmed = input.trim();
  if (!trimmed) return { json: null, error: null };

  const candidates = trimmed.startsWith('"') ? [trimmed] : [`"${trimmed}"`, trimmed];

  for (const candidate of candidates) {
    try {
      const unescaped = JSON.parse(candidate);
      if (typeof unescaped !== "string") continue;
      return { json: formatJsonPrecisely(unescaped), error: null };
    } catch {
      continue;
    }
  }

  // Not an escaped string literal at all - maybe it's already plain JSON.
  try {
    return { json: formatJsonPrecisely(trimmed), error: null };
  } catch {
    return { json: null, error: "Could not parse this as an escaped JSON string." };
  }
}
