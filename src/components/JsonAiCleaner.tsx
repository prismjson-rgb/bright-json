"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Eraser, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function extractJson(text: string): { result: string | null; method: string } {
  // 1. Markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]+?)\n?```/);
  if (codeBlockMatch) {
    const candidate = codeBlockMatch[1].trim();
    try { JSON.parse(candidate); return { result: candidate, method: "Extracted from markdown code block" }; } catch {}
  }

  // 2. Find first balanced { } or [ ]
  const cleaned = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  for (const [open, close] of [["{", "}"], ["[", "]"]] as const) {
    const start = cleaned.indexOf(open);
    if (start === -1) continue;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (esc) { esc = false; continue; }
      if (ch === "\\" && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === open) depth++;
      else if (ch === close) { depth--; if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);
        try { JSON.parse(candidate); return { result: candidate, method: `Found ${open}...${close} block in text` }; } catch {}
      }}
    }
  }

  // 3. Try entire text after cleaning
  const stripped = cleaned.replace(/^[^{\[]+/, "").replace(/[^}\]]+$/, "");
  try { JSON.parse(stripped); return { result: stripped, method: "Stripped surrounding text" }; } catch {}

  return { result: null, method: "" };
}

export default function JsonAiCleaner({ onUseJson, dark }: { onUseJson: (j: string) => void; dark: boolean }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.trim()) { setResult(null); setError(""); return; }
    const { result: r, method: m } = extractJson(input);
    if (r) {
      try {
        const pretty = JSON.stringify(JSON.parse(r), null, 2);
        setResult(pretty); setMethod(m); setError("");
      } catch { setResult(null); setError("Found JSON-like structure but it's still invalid"); }
    } else {
      setResult(null); setError("No valid JSON found in the text");
    }
  }, [input]);

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><Eraser className="w-3.5 h-3.5" /><span>AI Response Cleaner</span>
        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-50">Extracts JSON from mixed AI output</span>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          <div className="px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))] text-[10px] text-muted-foreground">
            Paste AI response (raw text, markdown, mixed content)
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 resize-none bg-background text-foreground font-mono text-xs p-4 outline-none leading-relaxed"
            placeholder={"Paste AI response here...\n\nFor example:\n  Sure! Here's the JSON you requested:\n\n  ```json\n  {\"name\": \"Alice\", \"age\": 30}\n  ```\n\n  Let me know if you need changes!"} />
        </div>

        {/* Output */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))]">
            {result ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-muted-foreground flex-1">{method}</span>
                <button onClick={() => onUseJson(result)}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors font-medium">
                  <ArrowRight className="w-3 h-3" /> Use in Editor
                </button>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] text-destructive">{error}</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">Extracted JSON will appear here</span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            {result ? (
              <MonacoEditor height="100%" language="json" theme={dark ? "vs-dark" : "vs"} value={result}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center text-sm">
                  <Eraser className="w-8 h-8 opacity-30 mx-auto mb-2" />
                  <p>Paste AI output on the left<br/>to extract clean JSON</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
