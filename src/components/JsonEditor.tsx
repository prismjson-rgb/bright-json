"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
      Loading editor…
    </div>
  ),
});

import type { EditorSettings } from "@/lib/settings";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  dark: boolean;
  editorSettings?: EditorSettings;
}

export default function JsonEditor({ value, onChange, error, dark, editorSettings }: JsonEditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;

    if (error) {
      const match = error.match(/position (\d+)/);
      let line = 1, col = 1;
      if (match) {
        const pos = parseInt(match[1]);
        const text = value.substring(0, pos);
        line = (text.match(/\n/g) || []).length + 1;
        col = pos - text.lastIndexOf("\n");
      }
      monaco.editor.setModelMarkers(model, "json", [
        {
          severity: monaco.MarkerSeverity.Error,
          message: error,
          startLineNumber: line,
          startColumn: col,
          endLineNumber: line,
          endColumn: col + 1,
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, "json", []);
    }
  }, [error, value]);

  const opts = editorSettings ?? {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    minimap: false,
    lineNumbers: "on" as const,
    wordWrap: "on" as const,
    tabSize: 2,
    paddingTop: 12,
    renderLineHighlight: "line" as const,
    bracketPairColorization: true,
  };

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language="json"
        theme={dark ? "vs-dark" : "vs"}
        value={value}
        onChange={(v) => onChange(v || "")}
        onMount={handleMount}
        options={{
          fontSize: opts.fontSize,
          fontFamily: opts.fontFamily,
          minimap: { enabled: opts.minimap },
          lineNumbers: opts.lineNumbers,
          scrollBeyondLastLine: false,
          wordWrap: opts.wordWrap,
          automaticLayout: true,
          padding: { top: opts.paddingTop },
          renderLineHighlight: opts.renderLineHighlight,
          bracketPairColorization: { enabled: opts.bracketPairColorization },
          tabSize: opts.tabSize,
        }}
      />
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-error/90 text-white text-xs px-3 py-1.5 font-mono truncate animate-slide-up">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
