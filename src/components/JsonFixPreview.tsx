"use client";
import { useMemo, useState } from "react";
import { Wrench, Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DebugIssue } from "@/lib/json-debug";
import { repairJson, summarizeFixes } from "@/lib/json-debug";
import { diffLines, compactDiff } from "@/lib/line-diff";
import { useSettings } from "@/contexts/SettingsContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  json: string;
  issues: DebugIssue[];
  onApply: (fixedJson: string, summary: string[]) => void;
}

/**
 * Diagnose → Preview → Apply → Validate → Format, in one dialog. `analyzeJson`
 * (via `issues`) already explained what's wrong; this only decides *whether*
 * to run the fix and lets the user see the result first — the actual repair
 * still comes from `repairJson` (jsonrepair).
 */
export default function JsonFixPreview({ open, onOpenChange, json, issues, onApply }: Props) {
  const { settings } = useSettings();
  const [showDiff, setShowDiff] = useState(false);

  const fixable = useMemo(() => issues.filter((i) => i.autoFixable), [issues]);
  const nonFixable = useMemo(() => issues.filter((i) => !i.autoFixable), [issues]);
  const summary = useMemo(() => summarizeFixes(issues), [issues]);

  const result = useMemo(() => {
    try {
      const repaired = repairJson(json);
      const obj = JSON.parse(repaired);
      const formatted = JSON.stringify(obj, null, settings.format.beautifyIndent);
      return { ok: true as const, output: formatted };
    } catch {
      return { ok: false as const, output: null as string | null };
    }
  }, [json, settings.format.beautifyIndent]);

  const diffRows = useMemo(() => {
    if (!showDiff || !result.ok || result.output == null) return [];
    return compactDiff(diffLines(json, result.output), 1);
  }, [showDiff, result, json]);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setShowDiff(false);
  };

  const handleFix = () => {
    if (!result.ok || result.output == null) return;
    onApply(result.output, summary);
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {result.ok ? `Fix ${fixable.length} issue${fixable.length !== 1 ? "s" : ""}?` : "Can't auto-fix this JSON"}
          </DialogTitle>
          <DialogDescription>
            {result.ok
              ? `${fixable.length} issue${fixable.length !== 1 ? "s" : ""} can be automatically fixed.`
              : "The structure is too broken to repair automatically — try fixing it manually in the editor."}
          </DialogDescription>
        </DialogHeader>

        {fixable.length > 0 && (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {fixable.map((issue) => (
              <div key={issue.id} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-foreground">{issue.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  line {issue.line}:{issue.col}
                </span>
              </div>
            ))}
          </div>
        )}

        {summary.length > 0 && (
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Changes</p>
            <ul className="flex flex-col gap-1">
              {summary.map((line) => (
                <li key={line} className="text-xs text-foreground">
                  – {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {nonFixable.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
            <span className="text-foreground">
              {nonFixable.length} issue{nonFixable.length !== 1 ? "s" : ""} need{nonFixable.length === 1 ? "s" : ""} manual attention and won&apos;t be
              changed{nonFixable.some((i) => i.type === "duplicate-key") ? " (duplicate keys)" : ""}.
            </span>
          </div>
        )}

        {showDiff && result.ok && (
          <div className="rounded-lg border border-border bg-surface2 max-h-56 overflow-y-auto font-mono text-[11px] leading-5">
            {diffRows.length === 0 && (
              <div className="px-3 py-2 text-muted-foreground">No textual changes (only formatting).</div>
            )}
            {diffRows.map((row, i) =>
              row.type === "gap" ? (
                <div key={i} className="px-3 py-0.5 text-muted-foreground/50 select-none">
                  ⋯
                </div>
              ) : (
                <div
                  key={i}
                  className={`px-3 whitespace-pre-wrap break-all ${
                    row.type === "add"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : row.type === "remove"
                      ? "bg-destructive/10 text-destructive line-through decoration-destructive/40"
                      : "text-muted-foreground"
                  }`}
                >
                  {row.type === "add" ? "+ " : row.type === "remove" ? "- " : "  "}
                  {row.text}
                </div>
              )
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          {result.ok && (
            <Button variant="outline" onClick={() => setShowDiff((s) => !s)}>
              {showDiff ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showDiff ? "Hide preview" : "Preview"}
            </Button>
          )}
          <Button onClick={handleFix} disabled={!result.ok}>
            <Wrench className="w-3.5 h-3.5" />
            Fix JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
