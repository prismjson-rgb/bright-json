"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PackageMinus, Copy, Download, Check } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function minimize(parsed: unknown, opts: { removeNull: boolean; removeEmptyArrays: boolean; removeEmptyObjects: boolean; removeEmptyStrings: boolean }): unknown {
  if (parsed === null) return opts.removeNull ? undefined : null;
  if (Array.isArray(parsed)) {
    const arr = parsed.map(i => minimize(i, opts)).filter(i => i !== undefined) as unknown[];
    return opts.removeEmptyArrays && arr.length === 0 ? undefined : arr;
  }
  if (typeof parsed === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed as object)) {
      const min = minimize(v, opts);
      if (min === undefined) continue;
      if (opts.removeEmptyArrays && Array.isArray(min) && min.length === 0) continue;
      if (opts.removeEmptyObjects && typeof min === "object" && min !== null && !Array.isArray(min) && Object.keys(min).length === 0) continue;
      obj[k] = min;
    }
    return opts.removeEmptyObjects && Object.keys(obj).length === 0 ? undefined : obj;
  }
  if (typeof parsed === "string" && opts.removeEmptyStrings && parsed === "") return undefined;
  return parsed;
}

export default function JsonMinimalMode({ parsed, dark }: { parsed: unknown; dark: boolean }) {
  const [removeNull, setRemoveNull] = useState(true);
  const [removeEmptyArrays, setRemoveEmptyArrays] = useState(true);
  const [removeEmptyObjects, setRemoveEmptyObjects] = useState(true);
  const [removeEmptyStrings, setRemoveEmptyStrings] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!parsed) return null;
    const min = minimize(parsed, { removeNull, removeEmptyArrays, removeEmptyObjects, removeEmptyStrings });
    return JSON.stringify(min, null, 2);
  }, [parsed, removeNull, removeEmptyArrays, removeEmptyObjects, removeEmptyStrings]);

  const originalSize = parsed ? new TextEncoder().encode(JSON.stringify(parsed)).length : 0;
  const minSize = result ? new TextEncoder().encode(result).length : 0;
  const savings = originalSize > 0 ? Math.round((1 - minSize / originalSize) * 100) : 0;

  const handleCopy = () => { if (result) { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "minimal.json"; a.click(); URL.revokeObjectURL(url);
  };

  const opts = [
    { label: "Remove null values", checked: removeNull, set: setRemoveNull },
    { label: "Remove empty arrays []", checked: removeEmptyArrays, set: setRemoveEmptyArrays },
    { label: "Remove empty objects {}", checked: removeEmptyObjects, set: setRemoveEmptyObjects },
    { label: "Remove empty strings \"\"", checked: removeEmptyStrings, set: setRemoveEmptyStrings },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><PackageMinus className="w-3.5 h-3.5" /><span>Minimal Mode</span>
        {savings > 0 && <span className="ml-auto text-[10px] text-emerald-500 font-normal normal-case tracking-normal">-{savings}% smaller</span>}
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Config */}
        <div className="w-56 shrink-0 border-r border-border p-4 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Remove</label>
            <div className="flex flex-col gap-2.5">
              {opts.map(o => (
                <label key={o.label} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={o.checked} onChange={e => o.set(e.target.checked)} className="accent-primary" />
                  <span className="text-xs text-foreground">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
          {originalSize > 0 && (
            <div className="rounded-lg bg-secondary p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Original</span><span className="font-mono">{originalSize.toLocaleString()} B</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Minimal</span><span className="font-mono">{minSize.toLocaleString()} B</span></div>
              <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Saved</span><span className="text-emerald-500">{savings}%</span></div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col flex-1 min-h-0">
          {result ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))]">
                <span className="text-[10px] text-muted-foreground flex-1">Minimal output</span>
                <button onClick={handleCopy} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleDownload} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoEditor height="100%" language="json" theme={dark ? "vs-dark" : "vs"} value={result}
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
              <div className="text-center"><PackageMinus className="w-8 h-8 opacity-30 mx-auto mb-2" /><p>No valid JSON loaded</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
