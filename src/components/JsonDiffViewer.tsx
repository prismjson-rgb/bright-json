import { Suspense, lazy, useMemo } from "react";

const MonacoDiffEditor = lazy(() =>
  import("@monaco-editor/react").then((mod) => ({ default: mod.DiffEditor }))
);

interface JsonDiffViewerProps {
  dark: boolean;
}

const LEFT_SAMPLE = JSON.stringify(
  {
    name: "JSON Viewer",
    version: "1.0.0",
    features: ["format", "minify", "validate"],
    config: { theme: "dark", fontSize: 13 },
    isAwesome: true,
  },
  null,
  2
);

const RIGHT_SAMPLE = JSON.stringify(
  {
    name: "JSON Viewer",
    version: "2.0.0",
    features: ["format", "minify", "validate", "diff", "tree view"],
    config: { theme: "light", fontSize: 14, wordWrap: true },
    isAwesome: true,
    newField: "hello",
  },
  null,
  2
);

export default function JsonDiffViewer({ dark }: JsonDiffViewerProps) {
  const options = useMemo(
    () => ({
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
      automaticLayout: true,
      padding: { top: 12 },
      renderSideBySide: true,
      readOnly: false,
      originalEditable: true,
    }),
    []
  );

  return (
    <div className="flex-1 min-h-0 w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
            Loading diff editor…
          </div>
        }
      >
        <MonacoDiffEditor
          height="100%"
          language="json"
          theme={dark ? "vs-dark" : "vs"}
          original={LEFT_SAMPLE}
          modified={RIGHT_SAMPLE}
          options={options}
        />
      </Suspense>
    </div>
  );
}
