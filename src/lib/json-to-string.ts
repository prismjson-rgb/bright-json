export function jsonToString(parsed: unknown): string {
  try {
    return JSON.stringify(JSON.stringify(parsed));
  } catch {
    return "Could not convert this JSON to a string.";
  }
}
