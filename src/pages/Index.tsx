import { useCallback, useEffect, useState } from "react";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useTheme } from "@/hooks/useTheme";
import Toolbar from "@/components/Toolbar";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeView from "@/components/JsonTreeView";
import { Code2, TreePine } from "lucide-react";

const SAMPLE = JSON.stringify(
  {
    name: "JSON Viewer",
    version: "1.0.0",
    description: "A modern, blazing-fast JSON formatter",
    features: ["format", "minify", "validate", "tree view", "syntax highlighting"],
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

export default function Index() {
  const { json, setJson, parsed, error, format, minify, sortKeys } = useJsonParser(SAMPLE);
  const { dark, toggle } = useTheme();
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

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
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [format, minify, toggle]);

  const lineCount = json.split("\n").length;

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
        dark={dark}
        hasJson={!!json.trim()}
      />

      <main className="flex flex-1 min-h-0">
        {/* Editor Pane */}
        <section className="flex-1 min-w-0 flex flex-col border-r border-border">
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

        {/* Tree View Pane */}
        <section className="flex-1 min-w-0 flex flex-col bg-surface">
          <div className="pane-header">
            <TreePine className="w-3.5 h-3.5" />
            <span>Tree View</span>
            {parsed !== null && (
              <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                {Array.isArray(parsed) ? `${(parsed as unknown[]).length} items` : `${Object.keys(parsed as object).length} keys`}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <JsonTreeView data={parsed} expandAll={expandAll} />
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="flex items-center gap-3">
          <span>{json.length.toLocaleString()} chars</span>
          <span className="text-border">·</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-2">
          {parsed !== null ? (
            <>
              <span className="glow-dot" />
              <span className="text-primary font-medium">Valid JSON</span>
            </>
          ) : error ? (
            <>
              <span className="glow-dot-error" />
              <span className="text-destructive font-medium">Invalid</span>
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
