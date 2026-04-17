"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InfoHelp } from "@/components/app/InfoHelp";
import type { TabData } from "@/lib/tabs-storage";

interface JsonTabBarProps {
  tabs: TabData[];
  activeId: string;
  onSwitch: (id: string) => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
}

export default function JsonTabBar({
  tabs,
  activeId,
  onSwitch,
  onClose,
  onRename,
  onAdd,
}: JsonTabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      const tab = tabs.find((t) => t.id === editingId);
      setEditValue(tab?.name ?? "");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId, tabs]);

  const handleStartRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditingId(id);
  };

  const handleCommitRename = () => {
    if (editingId) {
      onRename(editingId, editValue);
      setEditingId(null);
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-border/60 bg-[hsl(var(--pane-header))] shrink-0 overflow-x-auto px-1.5 pt-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1.5 px-2.5 py-1 border border-transparent rounded-t-md text-xs font-medium shrink-0 cursor-pointer transition-colors min-w-0 max-w-[160px] ${
            tab.id === activeId
              ? "border-t-primary/60 border-l-primary/60 border-r-primary/60 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
          onClick={() => editingId !== tab.id && onSwitch(tab.id)}
        >
          {editingId === tab.id ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCommitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 text-xs px-2 py-0 min-w-0 flex-1 max-w-[140px]"
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingId(null);
                }}
                className="shrink-0 flex h-6 w-6 items-center justify-center rounded border border-border/80 bg-secondary/50 text-muted-foreground hover:bg-destructive/15 hover:text-destructive hover:border-destructive/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title="Cancel rename"
                aria-label="Cancel rename"
              >
                <X className="w-3 h-3" strokeWidth={2.25} />
              </button>
            </div>
          ) : (
            <span
              className="truncate flex-1 min-w-0"
              onDoubleClick={(e) => handleStartRename(e, tab.id)}
              title="Double-click to rename"
            >
              {tab.name}
            </span>
          )}
          {editingId !== tab.id && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className={`shrink-0 flex h-6 w-6 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                tab.id === activeId
                  ? "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-destructive/15 hover:text-destructive hover:border-destructive/25"
                  : "border-transparent text-muted-foreground/85 hover:bg-destructive/12 hover:text-destructive hover:border-destructive/15"
              }`}
              title="Close tab"
              aria-label="Close tab"
            >
              <X className="w-3 h-3" strokeWidth={2.25} />
            </button>
          )}
        </div>
      ))}
      <InfoHelp
        text="Each tab has its own JSON buffer. Double-click a name to rename; use the adjacent button or Esc to cancel. Close a tab with the X on the right (at least one tab stays open). New tab: Ctrl/Cmd+T."
        label="About tabs"
        side="bottom"
        className="shrink-0 self-center mx-0.5"
      />
      <button
        type="button"
        onClick={onAdd}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/40 hover:text-foreground transition-colors"
        title="New tab"
        aria-label="New tab"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
