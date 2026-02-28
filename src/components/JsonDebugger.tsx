"use client";
import { Bug, Wrench, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { useJsonDebug } from "@/hooks/useJsonDebug";
import { applyAutoFix } from "@/lib/json-debug";
import { toast } from "sonner";

interface Props { json: string; onFix: (json: string) => void; }

export default function JsonDebugger({ json, onFix }: Props) {
  const issues = useJsonDebug(json);
  const fixableCount = issues.filter(i => i.autoFixable).length;

  const handleAutoFix = () => {
    const fixed = applyAutoFix(json);
    onFix(fixed);
    toast.success("Applied auto-fix to editor");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Bug className="w-3.5 h-3.5" />
        <span>JSON Debugger</span>
        {issues.length === 0 && json.trim() && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
            <CheckCircle2 className="w-3 h-3" /> Valid JSON
          </span>
        )}
        {fixableCount > 0 && (
          <button onClick={handleAutoFix}
            className="ml-auto flex items-center gap-1 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors font-medium">
            <Wrench className="w-3 h-3" /> Auto-fix {fixableCount} issue{fixableCount !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!json.trim() && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Bug className="w-8 h-8 opacity-30" />
            <p className="text-sm text-center">Paste or type JSON in the editor<br/>to see a diagnostic report</p>
          </div>
        )}

        {json.trim() && issues.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <div className="text-center">
              <p className="font-semibold text-foreground">No issues found</p>
              <p className="text-sm text-muted-foreground mt-1">Your JSON is valid and well-formed</p>
            </div>
          </div>
        )}

        {issues.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-muted-foreground">
              {issues.length} issue{issues.length !== 1 ? "s" : ""} found
              {fixableCount > 0 && ` · ${fixableCount} auto-fixable`}
            </p>
            {issues.map((issue, i) => (
              <div key={i}
                className={`rounded-lg border p-3 ${issue.severity === "error" ? "border-destructive/30 bg-destructive/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                <div className="flex items-start gap-2">
                  {issue.severity === "error"
                    ? <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${issue.severity === "error" ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"}`}>
                        Line {issue.line}{issue.col ? `:${issue.col}` : ""}
                      </span>
                      <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                        {issue.type}
                      </span>
                      {issue.autoFixable && (
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">auto-fixable</span>
                      )}
                    </div>
                    <p className="text-xs text-foreground">{issue.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
