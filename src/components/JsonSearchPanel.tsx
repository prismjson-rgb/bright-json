"use client";
import { useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";

interface JsonSearchPanelProps {
  query: string;
  matchCount: number;
  currentMatchIndex: number;
  onQueryChange: (q: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export default function JsonSearchPanel({
  query,
  matchCount,
  currentMatchIndex,
  onQueryChange,
  onNext,
  onPrev,
  onClose,
}: JsonSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-surface shrink-0 animate-slide-up">
      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search keys and values…"
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono min-w-0"
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.stopPropagation(); onClose(); }
          else if (e.key === "Enter") { e.preventDefault(); e.shiftKey ? onPrev() : onNext(); }
          else if (e.key === "ArrowDown") { e.preventDefault(); onNext(); }
          else if (e.key === "ArrowUp") { e.preventDefault(); onPrev(); }
        }}
      />
      {query && (
        <span
          className={`text-xs font-mono shrink-0 tabular-nums ${
            matchCount === 0 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {matchCount === 0
            ? "No matches"
            : `${currentMatchIndex + 1} / ${matchCount}`}
        </span>
      )}
      {matchCount > 0 && (
        <>
          <button
            onClick={onPrev}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Previous match (↑ or Shift+Enter)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNext}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Next match (↓ or Enter)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </>
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
