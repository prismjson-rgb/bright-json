"use client";
import { BarChart3 } from "lucide-react";
import { useJsonAnalyze } from "@/hooks/useJsonAnalyze";

export default function JsonStructureAnalyzer({ parsed }: { parsed: unknown }) {
  const stats = useJsonAnalyze(parsed);

  if (!parsed) return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><BarChart3 className="w-3.5 h-3.5" /><span>Structure Analyzer</span></div>
      <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
        <div className="text-center"><BarChart3 className="w-8 h-8 opacity-30 mx-auto mb-2" /><p>No valid JSON loaded</p></div>
      </div>
    </div>
  );

  if (!stats) return null;

  const typeColors: Record<string, string> = {
    string: "bg-[hsl(var(--json-string))]", number: "bg-[hsl(var(--json-number))]",
    boolean: "bg-[hsl(var(--json-boolean))]", null: "bg-muted-foreground",
    array: "bg-primary", object: "bg-[hsl(var(--json-key))]",
  };

  const totalTypeCount = Object.values(stats.typeDistribution).reduce((a, b) => a + b, 0);

  const statCards = [
    { label: "Total Keys", value: stats.totalKeys.toLocaleString() },
    { label: "Total Values", value: stats.totalValues.toLocaleString() },
    { label: "Max Depth", value: `${stats.maxDepth} levels` },
    { label: "Objects", value: stats.objectCount.toLocaleString() },
    { label: "Arrays", value: stats.arrayCount.toLocaleString() },
    { label: "Null Values", value: stats.nullCount.toLocaleString() },
    { label: "Total Size", value: stats.totalSize > 1024 ? `${(stats.totalSize / 1024).toFixed(1)} KB` : `${stats.totalSize} B` },
    { label: "Longest Key", value: stats.longestKey ? `"${stats.longestKey.slice(0, 20)}${stats.longestKey.length > 20 ? "\u2026" : ""}"` : "\u2014" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><BarChart3 className="w-3.5 h-3.5" /><span>Structure Analyzer</span></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stat cards */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            {statCards.map(c => (
              <div key={c.label} className="bg-secondary/50 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground mb-1">{c.label}</div>
                <div className="text-sm font-semibold text-foreground font-mono">{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Type distribution */}
        {totalTypeCount > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Type Distribution</h3>
            {/* Bar */}
            <div className="flex rounded-full overflow-hidden h-3 mb-3">
              {Object.entries(stats.typeDistribution).filter(([, v]) => v > 0).map(([type, count]) => (
                <div key={type} className={`${typeColors[type] || "bg-muted"}`}
                  style={{ width: `${(count / totalTypeCount) * 100}%` }} title={`${type}: ${count}`} />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(stats.typeDistribution).filter(([, v]) => v > 0).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${typeColors[type] || "bg-muted"}`} />
                  <span className="text-xs text-muted-foreground flex-1">{type}</span>
                  <span className="text-xs font-mono text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{Math.round((count / totalTypeCount) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
