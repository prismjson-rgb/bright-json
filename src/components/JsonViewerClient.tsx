"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Code2, TreePine, Columns2, ArrowLeftRight, StickyNote } from "lucide-react";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonSearch } from "@/hooks/useJsonSearch";
import Toolbar from "@/components/Toolbar";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeView from "@/components/JsonTreeView";
import JsonDiffViewer from "@/components/JsonDiffViewer";
import JsonConvertPanel from "@/components/JsonConvertPanel";
import JsonSearchPanel from "@/components/JsonSearchPanel";
import JsonNoteEditor from "@/components/JsonNoteEditor";

const SAMPLE = JSON.stringify(
  {
    name: "JSON Viewer",
    version: "2.0.0",
    description: "A modern, blazing-fast JSON formatter and viewer",
    features: [
      "format",
      "minify",
      "validate",
      "tree view",
      "syntax highlighting",
      "diff viewer",
      "JSON to YAML/XML/CSV",
      "search",
      "notes",
    ],
    config: {
      theme: "dark",
      fontSize: 13,
      wordWrap: true,
      lineNumbers: true,
    },
    stats: { users: 12500, rating: 4.9, downloads: 98200 },
    metadata: {
      author: "Developer",
      license: "MIT",
      repository: "https://github.com/example/json-viewer",
    },
    isAwesome: true,
    deprecated: false,
    notes: null,
  },
  null,
  2
);

export default function JsonViewerClient() {
  const { json, setJson, parsed, error, format, minify, sortKeys } =
    useJsonParser(SAMPLE);
  const { dark, toggle } = useTheme();

  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [diffMode, setDiffMode] = useState(false);
  const [convertMode, setConvertMode] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [noteMode, setNoteMode] = useState(false);

  const { query, setQuery, matchCount, matchPaths } = useJsonSearch(parsed);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json);
  }, [json]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [json]);

  const handleUpload = useCallback(
    (content: string) => {
      setJson(content);
      try {
        const obj = JSON.parse(content);
        setJson(JSON.stringify(obj, null, 2));
      } catch {}
    },
    [setJson]
  );

  const handleToggleTheme = useCallback(() => {
    toggle();
  }, [toggle]);

  const handleToggleDiff = useCallback(() => {
    setDiffMode((d) => {
      if (!d) {
        setConvertMode(false);
        setNoteMode(false);
      }
      return !d;
    });
  }, []);

  const handleToggleConvert = useCallback(() => {
    setConvertMode((c) => {
      if (!c) {
        setDiffMode(false);
        setNoteMode(false);
      }
      return !c;
    });
  }, []);

  const handleToggleSearch = useCallback(() => {
    setSearchMode((s) => {
      if (s) setQuery("");
      return !s;
    });
  }, [setQuery]);

  const handleToggleNote = useCallback(() => {
    setNoteMode((n) => {
      if (!n) {
        setDiffMode(false);
        setConvertMode(false);
      }
      return !n;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        format();
      } else if (mod && e.key.toLowerCase() === "m") {
        e.preventDefault();
        minify();
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault();
        handleToggleTheme();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleToggleDiff();
      } else if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleToggleSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [format, minify, handleToggleTheme, handleToggleDiff, handleToggleSearch]);

  const lineCount = json.split("\n").length;

  // Right pane label
  const rightPaneLabel = noteMode ? "Notes" : "Tree View";
  const RightPaneIcon = noteMode ? StickyNote : TreePine;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar
        onFormat={format}
        onMinify={minify}
        onSortKeys={sortKeys}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onToggleTheme={handleToggleTheme}
        onExpandAll={() => setExpandAll(true)}
        onCollapseAll={() => setExpandAll(false)}
        onToggleDiff={handleToggleDiff}
        onToggleConvert={handleToggleConvert}
        onToggleSearch={handleToggleSearch}
        onToggleNote={handleToggleNote}
        dark={dark}
        hasJson={!!json.trim()}
        diffMode={diffMode}
        convertMode={convertMode}
        searchMode={searchMode}
        noteMode={noteMode}
      />

      {/* ── DIFF MODE ── */}
      {diffMode && (
        <main className="flex flex-1 min-h-0 flex-col">
          <div className="pane-header">
            <Columns2 className="w-3.5 h-3.5" />
            <span>Diff Viewer</span>
            <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
              Left = current editor · Right = paste to compare
            </span>
          </div>
          <JsonDiffViewer dark={dark} originalJson={json} />
        </main>
      )}

      {/* ── NORMAL / CONVERT / NOTE MODE ── */}
      {!diffMode && (
        <main className="flex flex-1 min-h-0">
          {/* ── Left pane: Editor ── */}
          <section
            className={`flex flex-col border-r border-border ${
              convertMode ? "w-1/2 min-w-0" : "flex-1 min-w-0"
            }`}
          >
            <div className="pane-header">
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
              <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                {lineCount} lines
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <JsonEditor value={json} onChange={setJson} error={error} dark={dark} />
            </div>
          </section>

          {/* ── Right pane: Tree | Convert | Notes ── */}
          <section className="flex-1 min-w-0 flex flex-col bg-surface">
            {convertMode ? (
              <>
                <div className="pane-header">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Convert</span>
                </div>
                <div className="flex-1 min-h-0">
                  <JsonConvertPanel parsed={parsed} dark={dark} />
                </div>
              </>
            ) : (
              <>
                <div className="pane-header">
                  <RightPaneIcon className="w-3.5 h-3.5" />
                  <span>{rightPaneLabel}</span>
                  {!noteMode && parsed !== null && (
                    <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                      {Array.isArray(parsed)
                        ? `${(parsed as unknown[]).length} items`
                        : `${Object.keys(parsed as object).length} keys`}
                    </span>
                  )}
                </div>

                {/* Search bar (shown when searchMode and not noteMode) */}
                {searchMode && !noteMode && (
                  <JsonSearchPanel
                    query={query}
                    matchCount={matchCount}
                    onQueryChange={setQuery}
                    onClose={handleToggleSearch}
                  />
                )}

                <div className="flex-1 min-h-0 overflow-hidden">
                  {noteMode ? (
                    <JsonNoteEditor />
                  ) : (
                    <JsonTreeView
                      data={parsed}
                      expandAll={expandAll}
                      searchTerm={searchMode ? query : undefined}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      )}

      {/* ── Status Bar ── */}
      <footer className="status-bar">
        <div className="flex items-center gap-3">
          {diffMode ? (
            <span>Diff Mode</span>
          ) : convertMode ? (
            <span>Convert Mode</span>
          ) : noteMode ? (
            <span>Notes Mode</span>
          ) : (
            <>
              <span>{json.length.toLocaleString()} chars</span>
              <span className="text-border">·</span>
              <span>{lineCount} lines</span>
              {searchMode && query && (
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
          {diffMode ? (
            <span className="text-primary font-medium">Side-by-side comparison</span>
          ) : parsed !== null ? (
            <>
              <span className="glow-dot" />
              <span className="text-primary font-medium">Valid JSON</span>
            </>
          ) : error ? (
            <>
              <span className="glow-dot-error" />
              <span className="text-destructive font-medium">Invalid JSON</span>
            </>
          ) : (
            <span>No input</span>
          )}
        </div>
        <span>UTF-8 · JSON</span>
      </footer>
    </div>
  );
}
