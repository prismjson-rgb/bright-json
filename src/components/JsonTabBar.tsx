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
    <div className="workspace-document-tabs flex items-center min-w-0 flex-1 px-2 h-[46px]">
      <div className="flex min-w-0 max-w-[calc(100%-4.5rem)] items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-2.5 py-1 border border-transparent rounded-sm text-xs font-mono font-medium shrink-0 cursor-pointer transition-colors min-w-0 max-w-[190px] ${
              tab.id === activeId
                ? "border-b-primary bg-secondary/40 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            {editingId === tab.id ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  ref={inputRef}
                  aria-label="Tab name"
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
              <button
                type="button"
                className="truncate flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onSwitch(tab.id)}
                aria-pressed={tab.id === activeId}
                onKeyDown={(event) => {
                  if (event.key === "F2") { event.preventDefault(); setEditingId(tab.id); }
                }}
                onDoubleClick={(e) => handleStartRename(e, tab.id)}
                title="Double-click or press F2 to rename"
              >
                {tab.name}
              </button>
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

      </div>

      <button
        type="button"
        onClick={onAdd}
        className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center self-center rounded border border-primary/35 bg-primary/15 text-primary transition-colors hover:border-primary/60 hover:bg-primary/25 hover:text-primary"
        title="New tab"
        aria-label="New tab"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>

      <InfoHelp
        text="Each tab has its own JSON buffer. Double-click a name to rename; use the adjacent button or Esc to cancel. Close a tab with the X on the right (at least one tab stays open). New tab: Ctrl/Cmd+T."
        label="About tabs"
        side="bottom"
        className="ml-1 shrink-0 self-center"
      />
    </div>
  );
}
