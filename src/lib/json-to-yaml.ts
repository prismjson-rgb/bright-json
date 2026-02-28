import { stringify } from "yaml";

export function jsonToYaml(parsed: unknown): string {
  try {
    return stringify(parsed, { indent: 2, lineWidth: 0 });
  } catch (e) {
    return `# Error converting to YAML: ${e instanceof Error ? e.message : String(e)}`;
  }
}
