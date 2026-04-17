"use client";
import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { InfoHelp } from "@/components/app/InfoHelp";

interface JsonSearchPanelProps {
  query: string;
  matchCount: number;
  onQueryChange: (q: string) => void;
  onClose: () => void;
}

export default function JsonSearchPanel({
  query,
  matchCount,
  onQueryChange,
  onClose,
}: JsonSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface shrink-0 animate-slide-up">
      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <InfoHelp
        text="Matches keys and values in Tree or Visual view. Esc closes search. Counts update as you type."
        label="About search"
        side="bottom"
        className="shrink-0 -mr-1"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search keys and values…"
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />
      {query && (
        <span
          className={`text-xs font-mono shrink-0 ${
            matchCount === 0 ? "text-destructive" : "text-primary"
          }`}
        >
          {matchCount === 0 ? "No matches" : `${matchCount} match${matchCount !== 1 ? "es" : ""}`}
        </span>
      )}
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        title="Close search (Esc)"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
