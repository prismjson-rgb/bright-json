"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { EditorSettings } from "@/lib/settings";

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
  editorSettings?: EditorSettings;
}

export default function JsonDiffViewer({ dark, originalJson, editorSettings }: JsonDiffViewerProps) {
  const [modifiedJson, setModifiedJson] = useState("");

  const options = useMemo(
    () => {
      const e = editorSettings ?? {
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: false,
        lineNumbers: "on" as const,
        wordWrap: "on" as const,
        paddingTop: 12,
      };
      return {
        fontSize: e.fontSize,
        fontFamily: e.fontFamily,
        minimap: { enabled: e.minimap },
        lineNumbers: e.lineNumbers,
        scrollBeyondLastLine: false,
        wordWrap: e.wordWrap,
        automaticLayout: true,
        padding: { top: e.paddingTop },
        renderSideBySide: true,
        readOnly: false,
        originalEditable: true,
      };
    },
    [editorSettings]
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
