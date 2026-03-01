"use client";

import { useState, useCallback } from "react";
import {
  BookOpen, Copy, Check, ChevronDown, ChevronRight, GraduationCap,
  Sparkles, ExternalLink, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import {
  LEARN_LEVELS,
  getSectionsByLevel,
  type Level,
} from "@/lib/learn-content";

interface JsonLearnPanelProps {
  onTryInEditor?: (json: string) => void;
}

export default function JsonLearnPanel({ onTryInEditor }: JsonLearnPanelProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["what-is-json", "six-data-types", "syntax-rules"]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sections = getSectionsByLevel(selectedLevel);
  const currentLevelInfo = LEARN_LEVELS.find((l) => l.id === selectedLevel)!;

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>Learn JSON</span>
        </div>
        <Link
          href="/learn/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          title="Open full tutorial (SEO-friendly)"
        >
          Full tutorial <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Level tabs */}
        <aside className="w-36 shrink-0 border-r border-border bg-surface1/50 overflow-y-auto flex flex-col gap-1 p-2">
          {LEARN_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`text-left px-2 py-2 rounded-lg text-[11px] transition-colors ${
                selectedLevel === lvl.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
              title={lvl.description}
            >
              <span className="font-medium">{lvl.label}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <article className="max-w-2xl mx-auto space-y-6">
            <header className="mb-6">
              <h1 className="text-lg font-semibold text-foreground mb-1">
                {currentLevelInfo.label}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentLevelInfo.description}
              </p>
            </header>

            {sections.map((section) => {
              const isExpanded = expandedIds.has(section.id);
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="rounded-xl border border-border overflow-hidden bg-surface1/30"
                >
                  <button
                    onClick={() => toggleExpand(section.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <h2 className="text-sm font-semibold text-foreground flex-1 text-left">
                      {section.title}
                    </h2>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {(section.excerpt || section.contentMarkdown) && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {section.excerpt || section.contentMarkdown.slice(0, 200)}
                        </p>
                      )}

                      {section.tryExample && (
                        <CodeBlock
                          code={section.tryExample}
                          id={section.id}
                          copiedId={copiedId}
                          onCopy={copyCode}
                          onTry={onTryInEditor}
                          tryLabel="Try in editor"
                        />
                      )}

                      {section.keyTerms && section.keyTerms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {section.keyTerms.map((term) => (
                            <span
                              key={term}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/learn/${section.id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2"
                      >
                        Read full article <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </article>
        </main>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  id,
  copiedId,
  onCopy,
  onTry,
  tryLabel,
}: {
  code: string;
  id: string;
  copiedId: string | null;
  onCopy: (code: string, id: string) => void;
  onTry?: (json: string) => void;
  tryLabel?: string;
}) {
  const isJson = (() => {
    const t = code.trim();
    return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
  })();
  const canTry = isJson && onTry;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="relative group">
        <pre className="text-[11px] font-mono text-foreground bg-background p-3 overflow-x-auto max-h-48 overflow-y-auto">
          {code}
        </pre>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCopy(code, id)}
            className="p-1.5 rounded bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            {copiedId === id ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          {canTry && (
            <button
              onClick={() => onTry(code)}
              className="p-1.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-medium flex items-center gap-1"
              title={tryLabel || "Try in editor"}
            >
              <Sparkles className="w-3 h-3" />
              {tryLabel || "Try"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
