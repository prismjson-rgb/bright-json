import { Layers, ShieldCheck, Sparkles } from "lucide-react";
import { MODES, RAIL_GROUPS } from "./modes";
import { TOOL_LAUNCH_CONFIG, type ToolSlug } from "./tool-links";

export const TOOL_GROUPS: { label: string; help?: string; slugs: ToolSlug[] }[] = [
  { label: "Format & validate", help: RAIL_GROUPS[0].help, slugs: ["json-formatter", "json-validator", "json-schema-validator", "json-trimmer", "json-debugger"] },
  { label: "View & navigate", slugs: ["json-tree-view", "json-visual-editor", "json-flow-view", "json-diff-viewer", "json-bundle-viewer"] },
  { label: "Transform", help: RAIL_GROUPS[2].help, slugs: ["json-converter", "json-to-csv", "json-to-yaml", "json-to-xml", "json-to-string", "string-to-json", "json-minimal-mode"] },
  { label: "Analyze", help: RAIL_GROUPS[1].help, slugs: ["json-structure-analyzer", "json-best-practices-checker", "json-token-estimator", "ai-json-cleaner"] },
  { label: "Generate & share", slugs: ["json-mock-generator", "json-share-links", "json-notes"] },
  { label: "Learn", help: RAIL_GROUPS[3].help, slugs: ["learn-json"] },
];

export function workspaceTool(slug: ToolSlug) {
  const launch = TOOL_LAUNCH_CONFIG[slug];
  const mode = slug === "learn-json" ? MODES.learn : launch.opensShare ? MODES.share : launch.mode ? MODES[launch.mode] : undefined;
  const specific = slug === "json-formatter" || slug === "json-validator" || !!launch.convertFormat;
  return {
    ...launch,
    label: specific || !mode ? launch.title.replace(/ Converter$/, "") : mode.label,
    help: mode?.help ?? launch.hint,
    description: specific ? launch.hint : mode?.help ?? launch.hint,
    icon: slug === "json-formatter" ? Sparkles : slug === "json-validator" ? ShieldCheck : mode?.icon ?? Layers,
    shortcut: mode?.shortcut,
  };
}

export const FAVOURITES_KEY = "json-prism-workspace-favourites-v1";
export const DEFAULT_FAVOURITES: ToolSlug[] = ["json-debugger", "json-converter", "json-diff-viewer"];

export function parseFavourites(raw: string | null): ToolSlug[] {
  if (raw === null) return DEFAULT_FAVOURITES;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return DEFAULT_FAVOURITES;
    return [...new Set(value.filter((slug): slug is ToolSlug => typeof slug === "string" && Object.hasOwn(TOOL_LAUNCH_CONFIG, slug)))];
  } catch { return DEFAULT_FAVOURITES; }
}
