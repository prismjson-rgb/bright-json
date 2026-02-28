"use client";
import { TreePine, Columns2, Wand2, Bug, Scissors, Eraser, PackageMinus, BarChart3, Lightbulb, Hash, ArrowLeftRight, StickyNote, Search, BookOpen } from "lucide-react";
import type { PanelMode } from "./JsonViewerClient";

interface SidebarProps {
  mode: PanelMode;
  searchOpen: boolean;
  onMode: (mode: PanelMode) => void;
  onSearch: (open: boolean) => void;
}

const sections = [
  { label: "VIEW", items: [
    { mode: "tree" as PanelMode, icon: TreePine, label: "Tree View", shortcut: "Default" },
    { mode: "diff" as PanelMode, icon: Columns2, label: "Diff Viewer", shortcut: "⌘D" },
  ]},
  { label: "TOOLS", items: [
    { mode: "mock" as PanelMode, icon: Wand2, label: "Mock Generator" },
    { mode: "debug" as PanelMode, icon: Bug, label: "JSON Debugger" },
    { mode: "trim" as PanelMode, icon: Scissors, label: "JSON Trimmer" },
    { mode: "clean" as PanelMode, icon: Eraser, label: "AI Cleaner" },
    { mode: "minimal" as PanelMode, icon: PackageMinus, label: "Minimal Mode" },
  ]},
  { label: "ANALYZE", items: [
    { mode: "structure" as PanelMode, icon: BarChart3, label: "Structure Analyzer" },
    { mode: "practices" as PanelMode, icon: Lightbulb, label: "Best Practices" },
    { mode: "tokens" as PanelMode, icon: Hash, label: "Token Estimator" },
  ]},
  { label: "TRANSFORM", items: [
    { mode: "convert" as PanelMode, icon: ArrowLeftRight, label: "Convert" },
    { mode: "notes" as PanelMode, icon: StickyNote, label: "Notes" },
  ]},
  { label: "LEARN", items: [
    { mode: "learn" as PanelMode, icon: BookOpen, label: "Learn JSON" },
  ]},
];

export default function Sidebar({ mode, searchOpen, onMode, onSearch }: SidebarProps) {
  return (
    <aside className="flex flex-col w-12 shrink-0 border-r border-border bg-[hsl(var(--toolbar))] overflow-y-auto overflow-x-hidden">
      {sections.map((section, si) => (
        <div key={si} className={`flex flex-col py-1 ${si > 0 ? "border-t border-border/60" : ""}`}>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.mode;
            const title = "shortcut" in item && item.shortcut ? `${item.label} (${item.shortcut})` : item.label;
            return (
              <button
                key={item.mode}
                onClick={() => onMode(item.mode)}
                title={title}
                className={`sidebar-btn ${isActive ? "sidebar-btn-active" : ""}`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex flex-col py-1 border-t border-border/60">
        <button
          onClick={() => { if (mode !== "tree") onMode("tree"); onSearch(!searchOpen); }}
          title="Search (⌘K)"
          className={`sidebar-btn ${searchOpen ? "sidebar-btn-active" : ""}`}
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
      </div>
    </aside>
  );
}
