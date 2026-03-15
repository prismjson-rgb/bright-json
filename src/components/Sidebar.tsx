"use client";
import { Braces, TreePine, Columns2, Wand2, Bug, Scissors, Eraser, PackageMinus, BarChart3, Lightbulb, Hash, ArrowLeftRight, StickyNote, Search, BookOpen, Share2, Sun, Moon, Settings, FormInput, X } from "lucide-react";
import Link from "next/link";
import type { PanelMode } from "./JsonViewerClient";

interface SidebarProps {
  mode: PanelMode;
  searchOpen: boolean;
  shareOpen?: boolean;
  settingsOpen?: boolean;
  dark?: boolean;
  onMode: (mode: PanelMode) => void;
  onSearch: (open: boolean) => void;
  onShareClick?: () => void;
  onSettingsClick?: () => void;
  onToggleTheme?: () => void;
  onClose?: () => void;
}

const sections = [
  { label: "VIEW", items: [
    { mode: "tree" as PanelMode, icon: TreePine, label: "Tree View", shortcut: "Default" },
    { mode: "visual" as PanelMode, icon: FormInput, label: "Visual Editor", shortcut: "No-code" },
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
    { mode: "share" as PanelMode, icon: Share2, label: "Share & Export" },
  ]},
  { label: "LEARN", items: [
    { mode: "learn" as PanelMode, icon: BookOpen, label: "Learn JSON" },
  ]},
];

export default function Sidebar({ mode, searchOpen, shareOpen, settingsOpen, dark, onMode, onSearch, onShareClick, onSettingsClick, onToggleTheme, onClose }: SidebarProps) {
  return (
    <aside className={`flex flex-col border-r border-border bg-surface1 overflow-y-auto overflow-x-hidden ${onClose ? "w-full min-w-0" : "w-44 shrink-0"}`}>
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border/60 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-grad-teal flex items-center justify-center shrink-0 dark:text-white">
          <Braces className="w-4 h-4 text-primary dark:text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs tracking-tight text-foreground truncate">JSON Prism</div>
          <div className="text-[9px] text-muted-foreground truncate">Format · Diff · Transform</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {sections.map((section, si) => (
        <div key={si} className={`flex flex-col ${si > 0 ? "border-t border-border/60" : ""}`}>
          <span className="px-3 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-text3/60 select-none">
            {section.label}
          </span>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isShare = item.mode === "share";
            const isActive = isShare ? !!shareOpen : mode === item.mode;
            const title = "shortcut" in item && item.shortcut ? `${item.label} (${item.shortcut})` : item.label;
            const handleClick = isShare && onShareClick ? onShareClick : () => onMode(item.mode);
            return (
              <button
                key={item.mode}
                onClick={handleClick}
                title={title}
                className={`sidebar-btn ${isActive ? "sidebar-btn-active" : ""}`}
              >
                <Icon className="w-[15px] h-[15px] shrink-0" />
                <span className="text-xs truncate">{item.label}</span>
                {"shortcut" in item && item.shortcut && (
                  <span className="ml-auto text-[9px] opacity-40 font-mono shrink-0">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex flex-col border-t border-border/60">
        <span className="px-3 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-text3/60 select-none">
          UTILITY
        </span>
        <button
          onClick={() => { if (mode !== "tree") onMode("tree"); onSearch(!searchOpen); }}
          title="Search (⌘K)"
          className={`sidebar-btn ${searchOpen ? "sidebar-btn-active" : ""}`}
        >
          <Search className="w-[15px] h-[15px] shrink-0" />
          <span className="text-xs">Search</span>
          <span className="ml-auto text-[9px] opacity-40 font-mono shrink-0">⌘K</span>
        </button>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            title="Settings"
            className={`sidebar-btn ${settingsOpen ? "sidebar-btn-active" : ""}`}
          >
            <Settings className="w-[15px] h-[15px] shrink-0" />
            <span className="text-xs">Settings</span>
          </button>
        )}
      </div>
      {onToggleTheme && (
        <div className="mt-auto border-t border-border/60 p-2 flex flex-col gap-1">
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Toggle theme (⌘L)"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center justify-center gap-2 pb-1">
            <Link href="/privacy" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Privacy</Link>
            <span className="text-[9px] text-muted-foreground/30">·</span>
            <Link href="/terms" className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Terms</Link>
          </div>
        </div>
      )}
    </aside>
  );
}
