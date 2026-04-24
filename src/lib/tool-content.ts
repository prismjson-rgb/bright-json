import { TOOLS, TOOL_SLUGS, type ToolContent } from "./tool-content.generated";

export type { ToolContent };

export function getAllTools(): ToolContent[] {
  return TOOLS;
}

export function getAllToolSlugs(): string[] {
  return TOOL_SLUGS;
}

export function getToolBySlug(slug: string): ToolContent | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}
