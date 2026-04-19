import { encode } from "@toon-format/toon";

export function jsonToToon(parsed: unknown): string {
  try {
    return encode(parsed);
  } catch (e) {
    return `# Error converting to TOON: ${e instanceof Error ? e.message : String(e)}`;
  }
}
