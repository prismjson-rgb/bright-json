/**
 * Single source of truth for panel modes — labels, icons, grouping, layout,
 * and keyboard shortcuts. Navigation chrome (header tabs, left rail, mobile
 * header) reads from here so adding a mode = one object entry.
 *
 * The actual React components stay in JsonViewerClient since each panel
 * takes panel-specific props that don't unify cleanly into a generic map.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight, BarChart3, BookOpen, Bug, Columns2, Eraser, FormInput,
  GitBranch, Hash, Lightbulb, PackageMinus, Scissors, Share2, StickyNote,
  TreePine, Wand2,
} from "lucide-react";

export type PanelMode =
  | "tree" | "visual" | "flow" | "diff"
  | "mock" | "debug" | "trim" | "clean" | "minimal"
  | "structure" | "practices" | "tokens"
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
}

export const MODES: Record<PanelMode, ModeConfig> = {
  tree:      { id: "tree",      label: "Tree View",          icon: TreePine,       group: "view",      layout: "split",   hint: "Default" },
  visual:    { id: "visual",    label: "Visual Editor",      icon: FormInput,      group: "view",      layout: "split",   hint: "No-code" },
  flow:      { id: "flow",      label: "Flow View",          icon: GitBranch,      group: "view",      layout: "split",   hint: "Graph" },
  diff:      { id: "diff",      label: "Diff Viewer",        icon: Columns2,       group: "view",      layout: "focused", shortcut: "⌘D" },
  mock:      { id: "mock",      label: "Mock Generator",     icon: Wand2,          group: "tools",     layout: "split" },
  debug:     { id: "debug",     label: "JSON Debugger",      icon: Bug,            group: "tools",     layout: "split" },
  trim:      { id: "trim",      label: "JSON Trimmer",       icon: Scissors,       group: "tools",     layout: "split" },
  clean:     { id: "clean",     label: "AI Cleaner",         icon: Eraser,         group: "tools",     layout: "focused" },
  minimal:   { id: "minimal",   label: "Minimal Mode",       icon: PackageMinus,   group: "tools",     layout: "split" },
  structure: { id: "structure", label: "Structure Analyzer", icon: BarChart3,      group: "analyze",   layout: "split" },
  practices: { id: "practices", label: "Best Practices",     icon: Lightbulb,      group: "analyze",   layout: "split" },
  tokens:    { id: "tokens",    label: "Token Estimator",    icon: Hash,           group: "analyze",   layout: "split" },
  convert:   { id: "convert",   label: "Convert",            icon: ArrowLeftRight, group: "transform", layout: "split" },
  notes:     { id: "notes",     label: "Notes",              icon: StickyNote,     group: "transform", layout: "split" },
  share:     { id: "share",     label: "Share & Export",     icon: Share2,         group: "transform", layout: "split" },
  learn:     { id: "learn",     label: "Learn JSON",         icon: BookOpen,       group: "learn",     layout: "split" },
};

/** View modes promoted to the top header tabs. */
export const VIEW_MODES: PanelMode[] = ["tree", "visual", "flow", "diff"];

/** Groups shown in the left rail, in display order. */
export const RAIL_GROUPS: { key: ModeGroup; label: string }[] = [
  { key: "tools",     label: "Tools" },
  { key: "analyze",   label: "Analyze" },
  { key: "transform", label: "Transform" },
  { key: "learn",     label: "Learn" },
];

export function railModesForGroup(group: ModeGroup): ModeConfig[] {
  return Object.values(MODES).filter((m) => m.group === group);
}

export function getModeLabel(mode: PanelMode): string {
  return MODES[mode].label;
}

export function getModeLayout(mode: PanelMode): ModeLayout {
  return MODES[mode].layout;
}
