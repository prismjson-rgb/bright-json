import { stringify } from "@iarna/toml";

export function jsonToToml(parsed: unknown): string {
  try {
    // TOML requires the top-level element to be an object (or table).
    // If it's an array or primitive, we wrap it.
    if (typeof parsed !== "object" || parsed === null) {
      return stringify({ value: parsed as any });
    }
    if (Array.isArray(parsed)) {
      return stringify({ values: parsed as any });
    }
    return stringify(parsed as any);
  } catch (e) {
    return `# Error converting to TOML: ${e instanceof Error ? e.message : String(e)}`;
  }
}
