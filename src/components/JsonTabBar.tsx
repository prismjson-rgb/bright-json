"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
              className="h-6 text-xs px-2 py-0.5 min-w-[60px] max-w-[120px]"
            />
          ) : (
            <span
              className="truncate flex-1 min-w-0"
              onDoubleClick={(e) => handleStartRename(e, tab.id)}
              title="Double-click to rename"
            >
              {tab.name}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-opacity shrink-0"
            title="Close tab"
            aria-label="Close tab"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center w-7 h-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        title="New tab"
        aria-label="New tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
