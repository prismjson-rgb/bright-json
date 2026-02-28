"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonSearch } from "@/hooks/useJsonSearch";
import { toast } from "sonner";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/Sidebar";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeView from "@/components/JsonTreeView";
import JsonDiffViewer from "@/components/JsonDiffViewer";
import JsonConvertPanel from "@/components/JsonConvertPanel";
import JsonSearchPanel from "@/components/JsonSearchPanel";
import JsonNoteEditor from "@/components/JsonNoteEditor";
import JsonMockGenerator from "@/components/JsonMockGenerator";
import JsonDebugger from "@/components/JsonDebugger";
import JsonTrimmer from "@/components/JsonTrimmer";
import JsonAiCleaner from "@/components/JsonAiCleaner";
import JsonMinimalMode from "@/components/JsonMinimalMode";
import JsonStructureAnalyzer from "@/components/JsonStructureAnalyzer";
import JsonBestPractices from "@/components/JsonBestPractices";
import JsonTokenEstimator from "@/components/JsonTokenEstimator";
import JsonLearnPanel from "@/components/JsonLearnPanel";

export type PanelMode = "tree" | "diff" | "mock" | "debug" | "trim" | "clean"
  | "minimal" | "structure" | "practices" | "tokens" | "convert" | "notes" | "learn";

const SAMPLE = JSON.stringify({
  name: "JSON Prism",
  version: "2.0.0",
  description: "A modern, blazing-fast JSON formatter and viewer",
  features: ["format","minify","validate","tree view","syntax highlighting","diff viewer","JSON to YAML/XML/CSV","search","notes","mock generator","debugger","token estimator"],
  config: { theme: "dark", fontSize: 13, wordWrap: true, lineNumbers: true },
  stats: { users: 12500, rating: 4.9, downloads: 98200 },
  metadata: { author: "Developer", license: "MIT" },
  isAwesome: true,
  deprecated: false,
  notes: null,
}, null, 2);

// Mode label for status bar
const MODE_LABELS: Partial<Record<PanelMode, string>> = {
  diff: "Diff Mode", mock: "Mock Generator", debug: "JSON Debugger",
  trim: "JSON Trimmer", clean: "AI Cleaner", minimal: "Minimal Mode",
  structure: "Structure Analyzer", practices: "Best Practices",
  tokens: "Token Estimator", convert: "Convert Mode", notes: "Notes Mode",
  learn: "Learn JSON",
};

export default function JsonViewerClient() {
  const { json, setJson, parsed, error, format, minify, sortKeys } = useJsonParser(SAMPLE);
  const { dark, toggle } = useTheme();

  const [mode, setMode] = useState<PanelMode>("tree");
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  const { query, setQuery, matchCount } = useJsonSearch(parsed);

  // Load from URL hash on mount
  useEffect(() => {
    const m = window.location.hash.match(/^#json=(.+)/);
    if (m) {
      try {
        const decoded = decodeURIComponent(escape(atob(m[1])));
        setJson(decoded);
      } catch {}
    }
  }, [setJson]);

  const handleCopy = useCallback(() => { navigator.clipboard.writeText(json); }, [json]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "data.json"; a.click();
    URL.revokeObjectURL(url);
  }, [json]);

  const handleUpload = useCallback((content: string) => {
    setJson(content);
    try { setJson(JSON.stringify(JSON.parse(content), null, 2)); } catch {}
  }, [setJson]);

  const handleShare = useCallback(() => {
    if (json.length > 50000) {
      toast.warning("JSON is too large for a shareable link (>50KB)");
      return;
    }
    const b64 = btoa(unescape(encodeURIComponent(json)));
    const url = window.location.href.split("#")[0] + "#json=" + b64;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }, [json]);

  const handleMode = useCallback((m: PanelMode) => {
    setMode(m);
    if (m !== "tree") setSearchOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") {
        if (mode !== "tree") { setMode("tree"); setSearchOpen(false); }
        else if (searchOpen) { setSearchOpen(false); setQuery(""); }
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); format();
      } else if (mod && e.key.toLowerCase() === "m") {
        e.preventDefault(); minify();
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault(); toggle();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault(); setMode(m => m === "diff" ? "tree" : "diff");
      } else if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMode("tree");
        setSearchOpen(s => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, searchOpen, format, minify, toggle, setQuery]);

  const lineCount = json.split("\n").length;
  const modeLabel = MODE_LABELS[mode];

  const handleUseJson = useCallback((j: string) => {
    setJson(j);
    setMode("tree");
  }, [setJson]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar
        onFormat={format}
        onMinify={minify}
        onSortKeys={sortKeys}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onToggleTheme={toggle}
        onExpandAll={() => setExpandAll(true)}
        onCollapseAll={() => setExpandAll(false)}
        onShare={handleShare}
        dark={dark}
        hasJson={!!json.trim()}
        showTreeControls={mode === "tree"}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar mode={mode} searchOpen={searchOpen} onMode={handleMode} onSearch={setSearchOpen} />

        {/* Diff: full width */}
        {mode === "diff" && (
          <main className="flex flex-1 min-h-0 flex-col">
            <div className="pane-header">
              <span>Diff Viewer</span>
              <span className="text-[10px] font-normal normal-case tracking-normal opacity-50 ml-3">Left = current editor · Right = paste to compare</span>
              <button onClick={() => setMode("tree")} className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted/60 hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors duration-150" title="Exit (Esc)">&times; Exit · Esc</button>
            </div>
            <JsonDiffViewer dark={dark} originalJson={json} />
          </main>
        )}

        {/* AI Cleaner: own layout */}
        {mode === "clean" && (
          <main className="flex flex-1 min-h-0 flex-col">
            <JsonAiCleaner onUseJson={handleUseJson} dark={dark} />
          </main>
        )}

        {/* All other modes: editor left + panel right */}
        {mode !== "diff" && mode !== "clean" && (
          <main className="flex flex-1 min-h-0">
            <section className="flex flex-col flex-1 min-w-0 border-r border-border">
              <div className="pane-header">
                <span>Editor</span>
                <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">{lineCount} lines</span>
              </div>
              <div className="flex-1 min-h-0">
                <JsonEditor value={json} onChange={setJson} error={error} dark={dark} />
              </div>
            </section>

            <section className="flex flex-col flex-1 min-w-0 bg-[hsl(var(--surface))]">
              {/* Show search overlay on tree mode */}
              {mode === "tree" && searchOpen && (
                <JsonSearchPanel query={query} matchCount={matchCount} onQueryChange={setQuery} onClose={() => { setSearchOpen(false); setQuery(""); }} />
              )}

              {mode === "tree" && (
                <>
                  <div className="pane-header">
                    <span>Tree View</span>
                    {parsed !== null && (
                      <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                        {Array.isArray(parsed) ? `${(parsed as unknown[]).length} items` : `${Object.keys(parsed as object).length} keys`}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <JsonTreeView data={parsed} expandAll={expandAll} searchTerm={searchOpen ? query : undefined} />
                  </div>
                </>
              )}
              {mode === "mock" && <JsonMockGenerator onUseJson={handleUseJson} dark={dark} />}
              {mode === "debug" && <JsonDebugger json={json} onFix={setJson} />}
              {mode === "trim" && <JsonTrimmer parsed={parsed} dark={dark} />}
              {mode === "minimal" && <JsonMinimalMode parsed={parsed} dark={dark} />}
              {mode === "structure" && <JsonStructureAnalyzer parsed={parsed} />}
              {mode === "practices" && <JsonBestPractices parsed={parsed} />}
              {mode === "tokens" && <JsonTokenEstimator json={json} parsed={parsed} />}
              {mode === "convert" && <JsonConvertPanel parsed={parsed} dark={dark} />}
              {mode === "notes" && <JsonNoteEditor />}
              {mode === "learn" && <JsonLearnPanel />}
            </section>
          </main>
        )}
      </div>

      <footer className="status-bar">
        <div className="flex items-center gap-3">
          {modeLabel ? (
            <>
              <span>{modeLabel}</span>
              <span className="text-border">·</span>
              <span className="opacity-50">Esc to exit</span>
            </>
          ) : (
            <>
              <span>{json.length.toLocaleString()} chars</span>
              <span className="text-border">·</span>
              <span>{lineCount} lines</span>
              {searchOpen && query && (
                <>
                  <span className="text-border">·</span>
                  <span className={matchCount === 0 ? "text-destructive" : "text-primary"}>
                    {matchCount} match{matchCount !== 1 ? "es" : ""}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {parsed !== null ? (
            <><span className="glow-dot" /><span className="text-primary font-medium">Valid JSON</span></>
          ) : error ? (
            <><span className="glow-dot-error" /><span className="text-destructive font-medium">Invalid JSON</span></>
          ) : (
            <span>No input</span>
          )}
        </div>
        <span>UTF-8 · JSON</span>
      </footer>
    </div>
  );
}
