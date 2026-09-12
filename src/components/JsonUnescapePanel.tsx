"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Quote, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";
import { stringToJson } from "@/lib/string-to-json";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function JsonUnescapePanel({ onUseJson, dark }: { onUseJson: (j: string) => void; dark: boolean }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { json, error } = stringToJson(input);
    setResult(json);
    setError(error);
  }, [input]);

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Quote className="w-3.5 h-3.5" />
        <span>String to JSON</span>
        <InfoHelp text={MODES.unescape.help} label="About String to JSON" side="bottom" />
        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-50">
          Unescapes a JSON string literal back into JSON
        </span>
      </div>
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Input */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          <div className="px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))] text-[10px] text-muted-foreground">
            Paste an escaped JSON string
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none bg-background text-foreground font-mono text-xs p-4 outline-none leading-relaxed"
            placeholder={'Paste an escaped JSON string here...\n\nFor example:\n  "{\\"name\\":\\"Alice\\",\\"age\\":30}"'}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))]">
            {result ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-muted-foreground flex-1">Valid JSON recovered</span>
                <button
                  onClick={() => onUseJson(result)}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors font-medium"
                >
                  <ArrowRight className="w-3 h-3" /> Use in Editor
                </button>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] text-destructive">{error}</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">Recovered JSON will appear here</span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            {result ? (
              <MonacoEditor
                height="100%"
                language="json"
                theme={dark ? "vs-dark" : "vs"}
                value={result}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center text-sm">
                  <Quote className="w-8 h-8 opacity-30 mx-auto mb-2" />
                  <p>
                    Paste an escaped JSON string on the left
                    <br />
                    to recover readable JSON
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
