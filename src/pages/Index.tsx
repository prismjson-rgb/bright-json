import { useCallback, useEffect, useState } from "react";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useTheme } from "@/hooks/useTheme";
import Toolbar from "@/components/Toolbar";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeView from "@/components/JsonTreeView";

const SAMPLE = JSON.stringify(
  {
    name: "JSON Viewer",
    version: "1.0.0",
    features: ["format", "minify", "validate", "tree view"],
    settings: { theme: "dark", fontSize: 13, wordWrap: true },
    stats: { users: 12500, rating: 4.9 },
    isAwesome: true,
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
      // Auto-format if valid
      try {
        const obj = JSON.parse(content);
        setJson(JSON.stringify(obj, null, 2));
      } catch {}
    },
    [setJson]
  );

  // Keyboard shortcuts
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

      <div className="flex flex-1 min-h-0">
        {/* Editor Pane */}
        <div className="flex-1 min-w-0 border-r border-border">
          <JsonEditor value={json} onChange={setJson} error={error} dark={dark} />
        </div>

        {/* Tree View Pane */}
        <div className="flex-1 min-w-0 bg-surface overflow-auto">
          <JsonTreeView data={parsed} expandAll={expandAll} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-[11px] text-muted-foreground bg-toolbar border-t border-border font-mono">
        <span>{json.length.toLocaleString()} chars</span>
        <span>
          {parsed !== null ? (
            <span className="text-primary">✓ Valid JSON</span>
          ) : error ? (
            <span className="text-destructive">✗ Invalid</span>
          ) : (
            "No input"
          )}
        </span>
        <span>UTF-8 · JSON</span>
      </div>
    </div>
  );
}
