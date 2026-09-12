/**
 * Reverses jsonToString: takes a pasted escaped JSON string (with or without
 * surrounding quotes) and recovers the pretty-printed JSON it represents.
 */
export function stringToJson(input: string): { json: string | null; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { json: null, error: null };

  const candidates = trimmed.startsWith('"') ? [trimmed] : [`"${trimmed}"`, trimmed];

  for (const candidate of candidates) {
    try {
      const unescaped = JSON.parse(candidate);
      if (typeof unescaped !== "string") continue;
      const parsed = JSON.parse(unescaped);
      return { json: JSON.stringify(parsed, null, 2), error: null };
    } catch {
      continue;
    }
  }

  // Not an escaped string literal at all — maybe it's already plain JSON.
  try {
    const parsed = JSON.parse(trimmed);
    return { json: JSON.stringify(parsed, null, 2), error: null };
  } catch {
    return { json: null, error: "Could not parse this as an escaped JSON string." };
  }
}
