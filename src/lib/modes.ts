/**
 * Single source of truth for panel modes — labels, icons, grouping, layout,
 * keyboard shortcuts, and help copy for info tooltips. Navigation chrome
 * (header tabs, left rail, mobile header) reads from here so adding a mode
 * = one object entry.
 *
 * The actual React components stay in JsonViewerClient since each panel
 * takes panel-specific props that don't unify cleanly into a generic map.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight, BarChart3, BookOpen, Bug, Columns2, Eraser, FormInput,
  GitBranch, Hash, Lightbulb, PackageMinus, Scissors, Share2, ShieldCheck, StickyNote,
  TreePine, Wand2,
} from "lucide-react";

export type PanelMode =
  | "tree" | "visual" | "flow" | "diff"
  | "mock" | "debug" | "trim" | "clean" | "minimal"
  | "structure" | "practices" | "tokens" | "schema"
  | "convert" | "notes" | "share" | "learn";

export type ModeGroup = "view" | "tools" | "analyze" | "transform" | "learn";

/** "split" = editor on left, panel on right. "focused" = full width, no editor. */
export type ModeLayout = "split" | "focused";

export interface ModeConfig {
  id: PanelMode;
  label: string;
  icon: LucideIcon;
  group: ModeGroup;
  layout: ModeLayout;
  /** Keyboard shortcut hint (display only; actual handler lives in viewer). */
  shortcut?: string;
  /** Short hint shown beside the label in the left rail. */
  hint?: string;
  /** Tooltip for the info icon (rail, headers, mobile). */
  help: string;
  /** True for modes that exist in the registry but should not appear in the
   *  left rail (e.g. share, which is triggered from the top header icon). */
  hideFromRail?: boolean;
}

export const MODES: Record<PanelMode, ModeConfig> = {
  tree: {
    id: "tree",
    label: "Tree View",
    icon: TreePine,
    group: "view",
    layout: "split",
    hint: "Default",
    help: "Expandable hierarchy of your JSON. When the document is valid, use search (Ctrl/Cmd+K) to highlight matching keys and values.",
  },
  visual: {
    id: "visual",
    label: "Visual Editor",
    icon: FormInput,
    group: "view",
    layout: "split",
    hint: "No-code",
    help: "Edit objects and arrays with form fields. Changes stay in sync with the raw JSON in the left editor.",
  },
  flow: {
    id: "flow",
    label: "Flow View",
    icon: GitBranch,
    group: "view",
    layout: "split",
    hint: "Graph",
    help: "Interactive graph of nested data. Pan, scroll to zoom, and drag nodes to explore large structures.",
  },
  diff: {
    id: "diff",
    label: "Diff Viewer",
    icon: Columns2,
    group: "view",
    layout: "focused",
    shortcut: "\u2318D",
    help: "Compare the current tab (left) with JSON you paste on the right. Exit with Esc or the close control.",
  },
  mock: {
    id: "mock",
    label: "Mock Generator",
    icon: Wand2,
    group: "tools",
    layout: "split",
    help: "Build sample JSON from templates or custom fields. Send output to the editor or download a file.",
  },
  debug: {
    id: "debug",
    label: "JSON Debugger",
    icon: Bug,
    group: "tools",
    layout: "split",
    help: "Inspect parse errors, jump to positions, and apply safe auto-fixes where possible.",
  },
  trim: {
    id: "trim",
    label: "JSON Trimmer",
    icon: Scissors,
    group: "tools",
    layout: "split",
    help: "Strip noise (comments, trailing commas, extra whitespace) to get strict JSON.",
  },
  clean: {
    id: "clean",
    label: "AI Cleaner",
    icon: Eraser,
    group: "tools",
    layout: "focused",
    help: "Paste messy LLM output; extract and clean JSON. Always review before using in production.",
  },
  minimal: {
    id: "minimal",
    label: "Minimal Mode",
    icon: PackageMinus,
    group: "tools",
    layout: "split",
    help: "Include or exclude paths to produce a smaller JSON payload from the same document.",
  },
  structure: {
    id: "structure",
    label: "Structure Analyzer",
    icon: BarChart3,
    group: "analyze",
    layout: "split",
    help: "Counts keys, types, depth, and size so you can see how complex the document is at a glance.",
  },
  practices: {
    id: "practices",
    label: "Best Practices",
    icon: Lightbulb,
    group: "analyze",
    layout: "split",
    help: "Lightweight checks for nesting depth, naming, payload size, and similar maintainability issues.",
  },
  tokens: {
    id: "tokens",
    label: "Token Estimator",
    icon: Hash,
    group: "analyze",
    layout: "split",
    help: "Rough token counts for LLM context (approximate; real models tokenize differently). Compare JSON vs YAML/XML.",
  },
  schema: {
    id: "schema",
    label: "Schema Validator",
    icon: ShieldCheck,
    group: "analyze",
    layout: "split",
    help: "Paste a JSON Schema (Draft 7) and instantly see whether the current JSON is valid — with per-field error paths.",
  },
  convert: {
    id: "convert",
    label: "Convert",
    icon: ArrowLeftRight,
    group: "transform",
    layout: "split",
    help: "Turn valid JSON into YAML, XML, or CSV. Output is read-only; edit the source JSON on the left.",
  },
  notes: {
    id: "notes",
    label: "Notes",
    icon: StickyNote,
    group: "transform",
    layout: "split",
    help: "Rich-text notes beside your session. They do not change JSON validity or tab contents.",
  },
  share: {
    id: "share",
    label: "Share & Export",
    icon: Share2,
    group: "transform",
    layout: "split",
    hideFromRail: true,
    help: "Encode JSON into links or files. By default nothing is uploaded; optional short links may use temporary storage—see the privacy note in the panel.",
  },
  learn: {
    id: "learn",
    label: "Learn JSON",
    icon: BookOpen,
    group: "learn",
    layout: "split",
    help: "In-app lessons and examples. Use Try in editor to load sample JSON into a tab.",
  },
};

/** View modes promoted to the top header tabs. */
export const VIEW_MODES: PanelMode[] = ["tree", "visual", "flow", "diff"];

/** Groups shown in the left rail, in display order. */
export const RAIL_GROUPS: { key: ModeGroup; label: string; help: string }[] = [
  {
    key: "tools",
    label: "Tools",
    help: "Generate mock data, debug parses, trim noise, run AI cleanup, or shrink payloads—editor stays on the left.",
  },
  {
    key: "analyze",
    label: "Analyze",
    help: "Measure structure, read best-practice hints, and estimate tokens for LLM-style workflows.",
  },
  {
    key: "transform",
    label: "Transform",
    help: "Convert to other text formats and keep free-form notes next to your JSON.",
  },
  {
    key: "learn",
    label: "Learn",
    help: "Guided topics and snippets; open the full tutorial site from the panel header when you need more.",
  },
];

export function railModesForGroup(group: ModeGroup): ModeConfig[] {
  return Object.values(MODES).filter((m) => m.group === group && !m.hideFromRail);
}

export function getModeLabel(mode: PanelMode): string {
  return MODES[mode].label;
}

export function getModeLayout(mode: PanelMode): ModeLayout {
  return MODES[mode].layout;
}
