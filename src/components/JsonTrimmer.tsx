"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Scissors, Download, Copy, Check } from "lucide-react";
import { extractPath, firstN, removeKeys, collapseDepth, getAllKeys } from "@/lib/json-trim";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function JsonTrimmer({ parsed, dark }: { parsed: unknown; dark: boolean }) {
  const [path, setPath] = useState("");
  const [nRecords, setNRecords] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [maxDepth, setMaxDepth] = useState(0); // 0 = no limit
  const [copied, setCopied] = useState(false);
  const [activeOp, setActiveOp] = useState<"path" | "firstN" | "removeKeys" | "depth">("path");

  const allKeys = useMemo(() => getAllKeys(parsed, 0, 3), [parsed]);

  const result = useMemo(() => {
    if (!parsed) return null;
    try {
      let out: unknown = parsed;
      if (activeOp === "path") out = path ? extractPath(parsed, path) : parsed;
      else if (activeOp === "firstN") out = firstN(parsed, nRecords);
      else if (activeOp === "removeKeys") out = removeKeys(parsed, selectedKeys);
      else if (activeOp === "depth") out = maxDepth > 0 ? collapseDepth(parsed, maxDepth) : parsed;
      return JSON.stringify(out, null, 2);
    } catch { return null; }
  }, [parsed, activeOp, path, nRecords, selectedKeys, maxDepth]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "trimmed.json"; a.click(); URL.revokeObjectURL(url);
  };

  const ops = [
    { id: "path" as const, label: "Extract Path" },
    { id: "firstN" as const, label: "First N Records" },
    { id: "removeKeys" as const, label: "Remove Keys" },
    { id: "depth" as const, label: "Collapse Depth" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Scissors className="w-3.5 h-3.5" />
        <span>JSON Trimmer</span>
        <InfoHelp text={MODES.trim.help} label="About JSON Trimmer" side="bottom" />
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Config */}
        <div className="w-60 shrink-0 border-r border-border flex flex-col overflow-y-auto p-4 gap-4">
          {/* Operation selector */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Operation</label>
            <div className="flex flex-col gap-1">
              {ops.map(op => (
                <button key={op.id} onClick={() => setActiveOp(op.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeOp === op.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-muted-foreground"}`}>
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {activeOp === "path" && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Path</label>
              <input value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. data.items[0]"
                className="w-full bg-secondary text-foreground text-xs rounded-lg px-3 py-2 border border-border font-mono placeholder:text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground mt-1">Use dot notation and [n] for arrays</p>
            </div>
          )}

          {activeOp === "firstN" && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Records: {nRecords}</label>
              <input type="range" min={1} max={100} value={nRecords} onChange={e => setNRecords(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1</span><span>100</span></div>
            </div>
          )}

          {activeOp === "removeKeys" && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Keys to Remove</label>
              {allKeys.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">No JSON loaded</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {allKeys.map(k => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedKeys.includes(k)}
                        onChange={e => setSelectedKeys(prev => e.target.checked ? [...prev, k] : prev.filter(x => x !== k))}
                        className="accent-primary" />
                      <span className="text-xs font-mono text-foreground truncate">{k}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeOp === "depth" && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Max Depth: {maxDepth === 0 ? "No limit" : maxDepth}</label>
              <input type="range" min={0} max={10} value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>No limit</span><span>10</span></div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col flex-1 min-h-0">
          {result ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[hsl(var(--pane-header))]">
                <span className="text-[10px] text-muted-foreground flex-1">{result.split("\n").length} lines</span>
                <button onClick={handleCopy} title="Copy" className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleDownload} title="Download" className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
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
              {parsed ? "Configure operation on the left" : "No valid JSON loaded"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
