"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { analyzeJson, repairJson } from "@/lib/json-debug";
import { assertInputBudget } from "@/lib/input-limits";
import type { TutorialSection } from "@/lib/learn-content";

const ISSUE_LESSON: Record<string, string> = {
  "trailing-comma": "fixing-trailing-commas", "unclosed-bracket": "unexpected-end-of-json-input",
  "duplicate-key": "json-duplicate-keys", "unquoted-key": "fix-unquoted-keys-json",
  "single-quote": "fix-single-quotes-json", "markdown-fence": "clean-chatgpt-json",
  "surrounding-text": "fixing-llm-json", syntax: "json-parse-error-position",
};

export function LearnDiagnostic({ lessons, compact = false }: { lessons: TutorialSection[]; compact?: boolean }) {
  const [value, setValue] = useState("");
  const [fixError, setFixError] = useState("");
  const diagnosis = useMemo(() => {
    const text = value.trim();
    if (!text) return null;
    try {
      assertInputBudget(value);
    } catch (error) {
      return { title: "Input is too large to inspect here", message: error instanceof Error ? error.message : "Split this input into smaller parts.", id: "performance-large-files", fixable: false, position: "processing limit" };
    }
    if (value.charCodeAt(0) === 0xFEFF) return { title: "A byte-order mark starts this file", message: "An invisible BOM is at position 0. Remove it before parsing.", id: "json-bom-error", fixable: true, position: "position 0" };
    if (text.startsWith("<")) return { title: "This is HTML, not JSON", message: "The response starts with <. Check the request status, URL and Content-Type before parsing.", id: "unexpected-token-in-json", fixable: false, position: "position 0" };
    const issues = analyzeJson(value);
    const first = issues.find((issue) => issue.severity === "error") || issues[0];
    if (!first) return { title: "This JSON parses cleanly", message: "No syntax errors found. If the data still fails, check its expected shape.", id: "json-schema-basics", fixable: false, position: "valid JSON" };
    return { title: first.title, message: first.message, id: ISSUE_LESSON[first.type], fixable: first.autoFixable, position: `line ${first.line}, column ${first.col}` };
  }, [value]);
  const lesson = lessons.find((item) => item.id === diagnosis?.id);
  const handleFix = () => {
    try {
      setValue(value.charCodeAt(0) === 0xFEFF ? value.slice(1) : repairJson(value));
      setFixError("");
    } catch {
      setFixError("This input cannot be repaired automatically. Open the debugger for a closer look.");
    }
  };
  return (
    <div className="learn-diagnostic">
      <div className="learn-card-heading"><span className="learn-accent-dot" />{compact ? "Check your own payload" : "Diagnose first, read second"}<span className="learn-local-note">runs locally · nothing uploaded</span></div>
      <div className="learn-diagnostic-body">
        <label className="sr-only" htmlFor={compact ? "article-json-probe" : "learn-json-probe"}>Paste JSON or an error response</label>
        <textarea id={compact ? "article-json-probe" : "learn-json-probe"} spellCheck={false} value={value} onChange={(event) => { setValue(event.target.value); setFixError(""); }} placeholder={compact ? "Paste the exact response you tried to parse…" : "Paste broken JSON or a response — we'll point you at the right lesson."} />
        {diagnosis && <div className="learn-diagnostic-result" role="status"><span className="learn-eyebrow">{diagnosis.position}</span><strong>{diagnosis.title}</strong><p>{diagnosis.message}</p><div className="learn-result-actions">{lesson && <Link href={`/learn/${lesson.id}/`}>Read: {lesson.title} →</Link>}{diagnosis.fixable && <button type="button" onClick={handleFix}>Auto-fix here</button>}</div></div>}
        {fixError && <p className="learn-error">{fixError}</p>}
      </div>
    </div>
  );
}
