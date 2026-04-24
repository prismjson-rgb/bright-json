import type { PanelMode } from "./modes";

export type ToolSlug =
  | "json-formatter"
  | "json-validator"
  | "json-tree-view"
  | "json-visual-editor"
  | "json-flow-view"
  | "json-diff-viewer"
  | "json-converter"
  | "json-debugger"
  | "json-trimmer"
  | "ai-json-cleaner"
  | "json-minimal-mode"
  | "json-structure-analyzer"
  | "json-best-practices-checker"
  | "json-token-estimator"
  | "json-mock-generator"
  | "json-share-links"
  | "json-notes"
  | "json-bundle-viewer"
  | "learn-json";

export interface ToolLaunchConfig {
  slug: ToolSlug;
  title: string;
  hint: string;
  appHref: string;
  mode?: PanelMode;
  opensShare?: boolean;
}

export const TOOL_LAUNCH_CONFIG: Record<ToolSlug, ToolLaunchConfig> = {
  "json-formatter": {
    slug: "json-formatter",
    title: "JSON Formatter",
    hint: "Paste or drop JSON, then use Beautify to normalize spacing and structure.",
    appHref: "/app/?tool=json-formatter",
    mode: "tree",
  },
  "json-validator": {
    slug: "json-validator",
    title: "JSON Validator",
    hint: "Paste JSON to validate syntax and inspect exact parser errors in the editor.",
    appHref: "/app/?tool=json-validator",
    mode: "tree",
  },
  "json-tree-view": {
    slug: "json-tree-view",
    title: "JSON Tree View",
    hint: "Open the tree panel to expand, search, and scan nested JSON faster.",
    appHref: "/app/?tool=json-tree-view",
    mode: "tree",
  },
  "json-visual-editor": {
    slug: "json-visual-editor",
    title: "JSON Visual Editor",
    hint: "Use form-style controls to edit objects and arrays without touching raw syntax.",
    appHref: "/app/?tool=json-visual-editor",
    mode: "visual",
  },
  "json-flow-view": {
    slug: "json-flow-view",
    title: "JSON Flow View",
    hint: "Explore relationships visually with the graph panel and zoomable nodes.",
    appHref: "/app/?tool=json-flow-view",
    mode: "flow",
  },
  "json-diff-viewer": {
    slug: "json-diff-viewer",
    title: "JSON Diff Viewer",
    hint: "Compare the active document with a second JSON payload side by side.",
    appHref: "/app/?tool=json-diff-viewer",
    mode: "diff",
  },
  "json-converter": {
    slug: "json-converter",
    title: "JSON Converter",
    hint: "Convert valid JSON into YAML, XML, or CSV from the transform panel.",
    appHref: "/app/?tool=json-converter",
    mode: "convert",
  },
  "json-debugger": {
    slug: "json-debugger",
    title: "JSON Debugger",
    hint: "Jump to parse failures and apply safe fixes for common syntax mistakes.",
    appHref: "/app/?tool=json-debugger",
    mode: "debug",
  },
  "json-trimmer": {
    slug: "json-trimmer",
    title: "JSON Trimmer",
    hint: "Strip comments, trailing commas, and loose formatting to get strict JSON.",
    appHref: "/app/?tool=json-trimmer",
    mode: "trim",
  },
  "ai-json-cleaner": {
    slug: "ai-json-cleaner",
    title: "AI JSON Cleaner",
    hint: "Extract usable JSON from messy LLM output, prose, and fenced code blocks.",
    appHref: "/app/?tool=ai-json-cleaner",
    mode: "clean",
  },
  "json-minimal-mode": {
    slug: "json-minimal-mode",
    title: "JSON Minimal Mode",
    hint: "Keep only the fields you need by including or excluding JSON paths.",
    appHref: "/app/?tool=json-minimal-mode",
    mode: "minimal",
  },
  "json-structure-analyzer": {
    slug: "json-structure-analyzer",
    title: "JSON Structure Analyzer",
    hint: "Review counts, nesting depth, and complexity signals for the active payload.",
    appHref: "/app/?tool=json-structure-analyzer",
    mode: "structure",
  },
  "json-best-practices-checker": {
    slug: "json-best-practices-checker",
    title: "JSON Best Practices Checker",
    hint: "Scan for maintainability risks like deep nesting, naming issues, and bulky payloads.",
    appHref: "/app/?tool=json-best-practices-checker",
    mode: "practices",
  },
  "json-token-estimator": {
    slug: "json-token-estimator",
    title: "JSON Token Estimator",
    hint: "Estimate how expensive your JSON may be in LLM context windows.",
    appHref: "/app/?tool=json-token-estimator",
    mode: "tokens",
  },
  "json-mock-generator": {
    slug: "json-mock-generator",
    title: "JSON Mock Generator",
    hint: "Build sample JSON quickly for demos, tests, payload design, and docs.",
    appHref: "/app/?tool=json-mock-generator",
    mode: "mock",
  },
  "json-share-links": {
    slug: "json-share-links",
    title: "JSON Share Links",
    hint: "Create fragment-based share links or optional short links from the share panel.",
    appHref: "/app/?tool=json-share-links",
    opensShare: true,
  },
  "json-notes": {
    slug: "json-notes",
    title: "JSON Notes",
    hint: "Keep working notes and annotations beside the active JSON document.",
    appHref: "/app/?tool=json-notes",
    mode: "notes",
  },
  "json-bundle-viewer": {
    slug: "json-bundle-viewer",
    title: "JSON Bundle Viewer",
    hint: "Open multi-document JSON bundles from one shareable link.",
    appHref: "/bundle/",
  },
  "learn-json": {
    slug: "learn-json",
    title: "Learn JSON",
    hint: "Browse step-by-step guides and practical JSON tutorials.",
    appHref: "/learn/",
  },
};

export function getToolLaunchConfig(slug: string): ToolLaunchConfig | undefined {
  return TOOL_LAUNCH_CONFIG[slug as ToolSlug];
}
