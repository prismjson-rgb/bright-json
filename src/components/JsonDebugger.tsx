"use client";
import { useEffect, useRef } from "react";
import { Bug, Wrench, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import type { DebugIssue } from "@/lib/json-debug";
import { InfoHelp } from "@/components/app/InfoHelp";
import { MODES } from "@/lib/modes";

interface Props {
  json: string;
  issues: DebugIssue[];
  activeIssueId?: string | null;
  onSelectIssue?: (issue: DebugIssue) => void;
  onOpenFixPreview: () => void;
}

export default function JsonDebugger({ json, issues, activeIssueId, onSelectIssue, onOpenFixPreview }: Props) {
  const fixableCount = issues.filter(i => i.autoFixable).length;
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIssueId) activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIssueId]);

  return (
    <div className="flex flex-col h-full">
      <div className="pane-header">
        <Bug className="w-3.5 h-3.5" />
        <span>JSON Debugger</span>
        <InfoHelp text={MODES.debug.help} label="About JSON Debugger" side="bottom" />
        {issues.length === 0 && json.trim() && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
            <CheckCircle2 className="w-3 h-3" /> Valid JSON
          </span>
        )}
        {fixableCount > 0 && (
          <button onClick={onOpenFixPreview}
            className="ml-auto flex items-center gap-1 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md transition-colors font-medium">
            <Wrench className="w-3 h-3" /> Fix {fixableCount} issue{fixableCount !== 1 ? "s" : ""}
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
            {issues.map((issue) => {
              const isActive = issue.id === activeIssueId;
              return (
                <div key={issue.id}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onSelectIssue?.(issue)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onSelectIssue?.(issue); }}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                    isActive
                      ? "ring-2 ring-primary/60 border-primary/40 bg-primary/5"
                      : issue.severity === "error"
                      ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                      : "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10"
                  }`}>
                  <div className="flex items-start gap-2">
                    {issue.severity === "error"
                      ? <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{issue.title}</span>
                        <span className={`text-[10px] font-mono ${issue.severity === "error" ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"}`}>
                          {issue.line}:{issue.col}
                        </span>
                        {issue.autoFixable && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">auto-fixable</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
