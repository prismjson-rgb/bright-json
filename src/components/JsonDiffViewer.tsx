"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => ({ default: mod.DiffEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
        Loading diff editor…
      </div>
    ),
  }
);

interface JsonDiffViewerProps {
  dark: boolean;
  originalJson: string;
}

export default function JsonDiffViewer({ dark, originalJson }: JsonDiffViewerProps) {
  const [modifiedJson, setModifiedJson] = useState("");

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
    <div className="flex-1 min-h-0 w-full flex flex-col">
      <div className="flex text-[10px] font-mono text-muted-foreground border-b border-border">
        <div className="flex-1 px-4 py-1.5 border-r border-border">Original (current editor)</div>
        <div className="flex-1 px-4 py-1.5">Modified (paste to compare)</div>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoDiffEditor
          height="100%"
          language="json"
          theme={dark ? "vs-dark" : "vs"}
          original={originalJson}
          modified={modifiedJson}
          options={options}
        />
      </div>
    </div>
  );
}
