"use client";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import { useJsonAnalyze } from "@/hooks/useJsonAnalyze";
import type { JsonStructure } from "@/lib/json-analyze";

interface Issue {
  severity: "warning" | "info";
  title: string;
  description: string;
  suggestion: string;
}

function analyzeIssues(parsed: unknown, stats: JsonStructure | null): Issue[] {
  if (!parsed || !stats) return [];
  const issues: Issue[] = [];

  if (stats.maxDepth > 5) {
    issues.push({ severity: "warning", title: "Deeply nested structure", description: `JSON is ${stats.maxDepth} levels deep.`, suggestion: "Consider flattening to reduce complexity and improve readability" });
  }

  if (stats.nullCount > 0) {
    issues.push({ severity: "info", title: `${stats.nullCount} null value${stats.nullCount > 1 ? "s" : ""}`, description: "Null values add payload size without conveying data.", suggestion: "Consider omitting null keys to reduce payload — use Minimal Mode" });
  }

  if (stats.longestKeyLength > 25) {
    issues.push({ severity: "info", title: "Very long key name", description: `Key "${stats.longestKey.slice(0, 30)}${stats.longestKey.length > 30 ? "\u2026" : ""}" is ${stats.longestKeyLength} characters.`, suggestion: "Long keys increase token count and payload size. Consider abbreviating" });
  }

  if (stats.totalSize > 100_000) {
    issues.push({ severity: "warning", title: "Large JSON payload", description: `Total size is ${(stats.totalSize / 1024).toFixed(1)} KB.`, suggestion: "Consider pagination, streaming, or extracting only needed fields" });
  }

  // Check for mixed types in arrays
  if (Array.isArray(parsed)) {
    const types = new Set(parsed.map(i => i === null ? "null" : Array.isArray(i) ? "array" : typeof i));
    if (types.size > 1) {
      issues.push({ severity: "info", title: "Mixed types in root array", description: `Array contains ${[...types].join(", ")} types.`, suggestion: "Homogeneous arrays are easier to process and document" });
    }
  }

  // Check key naming consistency
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed as object);
    const hasCamel = keys.some(k => /[a-z][A-Z]/.test(k));
    const hasSnake = keys.some(k => /_/.test(k));
    if (hasCamel && hasSnake) {
      issues.push({ severity: "info", title: "Inconsistent key naming", description: "Mix of camelCase and snake_case keys detected.", suggestion: "Pick one convention and apply it consistently" });
    }
  }

  if (issues.length === 0) {
    issues.push({ severity: "info", title: "No issues detected", description: "Your JSON follows good structure practices.", suggestion: "" });
  }

  return issues;
}

export default function JsonBestPractices({ parsed }: { parsed: unknown }) {
  const stats = useJsonAnalyze(parsed);
  const issues = analyzeIssues(parsed, stats);

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header"><Lightbulb className="w-3.5 h-3.5" /><span>Best Practices</span></div>
      {!parsed ? (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          <div className="text-center"><Lightbulb className="w-8 h-8 opacity-30 mx-auto mb-2" /><p>No valid JSON loaded</p></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-[10px] text-muted-foreground">{issues.filter(i => i.severity === "warning").length} warnings · {issues.filter(i => i.severity === "info").length} suggestions</p>
          {issues.map((issue, i) => (
            <div key={i} className={`rounded-lg border p-3 ${issue.severity === "warning" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border bg-secondary/30"}`}>
              <div className="flex items-start gap-2">
                {issue.severity === "warning"
                  ? <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  : <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                  {issue.suggestion && <p className="text-[11px] text-primary mt-1.5">&rarr; {issue.suggestion}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
