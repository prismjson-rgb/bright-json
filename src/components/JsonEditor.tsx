"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

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
  onFocusChange?: (focused: boolean) => void;
}

export default function JsonEditor({ value, onChange, error, dark, editorSettings, onFocusChange }: JsonEditorProps) {
  const editorRef = useRef<any>(null);
  const onFocusChangeRef = useRef(onFocusChange);
  useEffect(() => { onFocusChangeRef.current = onFocusChange; }, [onFocusChange]);

  // Defer mounting Monaco (a heavy chunk + init) off the critical path. We paint
  // a lightweight text placeholder first so first paint / LCP isn't blocked, then
  // load the real editor when the browser is idle or the user interacts with it.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    const trigger = () => setReady(true);
    const w = window as any;
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(trigger, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(trigger, 1200);
    return () => clearTimeout(id);
  }, [ready]);

  const handleMount = useCallback((editor: any, _monaco: any) => {
    editorRef.current = editor;
    editor.focus();

    // Editor owns Cmd+F while it has focus (Monaco's native find/replace widget).
    // The app-level search (right-side tree view) only takes over Cmd+F when
    // focus is elsewhere, gated via onFocusChange below.
    editor.onDidFocusEditorText(() => onFocusChangeRef.current?.(true));
    editor.onDidBlurEditorText(() => onFocusChangeRef.current?.(false));
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

  if (!ready) {
    return (
      <div className="h-full w-full relative">
        <pre
          role="textbox"
          tabIndex={0}
          aria-label="JSON editor (loading)"
          onPointerDown={() => setReady(true)}
          onFocus={() => setReady(true)}
          className="h-full w-full overflow-auto px-4 pt-3 font-mono text-[13px] leading-5 text-foreground/90 whitespace-pre-wrap break-words cursor-text outline-none m-0"
        >
          {value}
        </pre>
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-error/90 text-white text-xs px-3 py-1.5 font-mono truncate animate-slide-up">
            ⚠ {error}
          </div>
        )}
      </div>
    );
  }

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
