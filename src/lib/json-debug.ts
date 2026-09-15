import { assertInputBudget } from "./input-limits";
import { jsonrepair } from "jsonrepair";

export type IssueType =
  | "trailing-comma"
  | "unclosed-bracket"
  | "duplicate-key"
  | "unquoted-key"
  | "single-quote"
  | "markdown-fence"
  | "surrounding-text"
  | "syntax";

export interface DebugIssue {
  id: string;
  line: number;
  col: number;
  /** Number of characters the issue spans on `line`, for marker ranges. */
  length: number;
  severity: "error" | "warning";
  type: IssueType;
  /** Short label, e.g. "Trailing comma". */
  title: string;
  /** One-sentence explanation of what's wrong. */
  message: string;
  autoFixable: boolean;
}

/** Human labels used for change summaries after a fix is applied/previewed. */
export const ISSUE_TYPE_LABELS: Record<IssueType, { singular: string; plural: string }> = {
  "trailing-comma": { singular: "trailing comma", plural: "trailing commas" },
  "unclosed-bracket": { singular: "missing bracket", plural: "missing brackets" },
  "duplicate-key": { singular: "duplicate key", plural: "duplicate keys" },
  "unquoted-key": { singular: "unquoted property name", plural: "unquoted property names" },
  "single-quote": { singular: "single-quoted string", plural: "single-quoted strings" },
  "markdown-fence": { singular: "markdown code fence", plural: "markdown code fences" },
  "surrounding-text": { singular: "block of surrounding text", plural: "blocks of surrounding text" },
  syntax: { singular: "syntax issue", plural: "syntax issues" },
};

function lineColAt(json: string, index: number): { line: number; col: number } {
  const before = json.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

/** Replaces the interior of double-quoted strings with `x` (keeping length/newlines
 *  intact) so later regexes can safely scan structure without matching inside strings. */
function maskDoubleQuotedStrings(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (ch === "\n") {
      out += "\n";
      inString = false;
      escaped = false;
      continue;
    }
    if (escaped) {
      out += "x";
      escaped = false;
      continue;
    }
    if (ch === "\\" && inString) {
      out += "x";
      escaped = true;
      continue;
    }
    if (ch === '"') {
      out += '"';
      inString = !inString;
      continue;
    }
    if (inString) {
      out += "x";
      continue;
    }
    out += ch;
  }
  return out;
}

/** Scope-aware scan (string-safe) that flags object keys repeated within the same
 *  object literal. Runs on both valid and invalid JSON since duplicate keys don't
 *  themselves break `JSON.parse`. */
function detectDuplicateKeys(json: string): DebugIssue[] {
  const issues: DebugIssue[] = [];
  type Scope = { type: "object"; seen: Map<string, number> } | { type: "array" };
  const stack: Scope[] = [];
  let i = 0;
  const n = json.length;
  while (i < n) {
    const ch = json[i];
    if (ch === '"') {
      const start = i;
      let j = i + 1;
      let content = "";
      let esc = false;
      while (j < n) {
        const cj = json[j];
        if (esc) {
          content += cj;
          esc = false;
          j++;
          continue;
        }
        if (cj === "\\") {
          esc = true;
          j++;
          continue;
        }
        if (cj === '"') {
          j++;
          break;
        }
        content += cj;
        j++;
      }
      let k = j;
      while (k < n && /\s/.test(json[k])) k++;
      const top = stack[stack.length - 1];
      if (json[k] === ":" && top?.type === "object") {
        if (top.seen.has(content)) {
          const { line, col } = lineColAt(json, start);
          issues.push({
            id: `duplicate-key-${line}-${col}-${content}`,
            line,
            col,
            length: content.length + 2,
            severity: "warning",
            type: "duplicate-key",
            title: "Duplicate key",
            message: `"${content}" appears more than once in this object. The later value overwrites the earlier one.`,
            autoFixable: false,
          });
        } else {
          top.seen.set(content, start);
        }
      }
      i = j;
      continue;
    }
    if (ch === "{") {
      stack.push({ type: "object", seen: new Map() });
      i++;
      continue;
    }
    if (ch === "[") {
      stack.push({ type: "array" });
      i++;
      continue;
    }
    if (ch === "}" || ch === "]") {
      stack.pop();
      i++;
      continue;
    }
    i++;
  }
  return issues;
}

function detectUnquotedKeys(json: string, masked: string): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const re = /([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked)) !== null) {
    const keyStart = m.index + m[1].length;
    const { line, col } = lineColAt(json, keyStart);
    issues.push({
      id: `unquoted-key-${line}-${col}`,
      line,
      col,
      length: m[2].length,
      severity: "error",
      type: "unquoted-key",
      title: "Unquoted property name",
      message: `"${m[2]}" must be wrapped in double quotes — JSON property names always need quotes.`,
      autoFixable: true,
    });
  }
  return issues;
}

function detectSingleQuotedStrings(json: string, masked: string): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const re = /'[^'\n]*'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked)) !== null) {
    const { line, col } = lineColAt(json, m.index);
    issues.push({
      id: `single-quote-${line}-${col}`,
      line,
      col,
      length: m[0].length,
      severity: "error",
      type: "single-quote",
      title: "Single-quoted string",
      message: "JSON strings must use double quotes, not single quotes.",
      autoFixable: true,
    });
  }
  return issues;
}

const FENCE_RE = /^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```\s*$/;

/** String-safe bracket match: given the index of an opening `{`/`[`, returns the
 *  substring up to (and including) its matching closer, or null if unbalanced. */
function extractBalancedJson(input: string, start: number): string | null {
  const openCh = input[start];
  const closeCh = openCh === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

interface SurroundingText {
  before: string;
  core: string;
  after: string;
}

/** Finds a balanced top-level `{...}`/`[...]` block with non-whitespace text
 *  before or after it (e.g. "Here is your JSON:\n\n{...}\n\nHope this helps"). */
function findSurroundingText(input: string): SurroundingText | null {
  let start = -1;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{" || input[i] === "[") {
      start = i;
      break;
    }
  }
  if (start === -1) return null;
  const core = extractBalancedJson(input, start);
  if (!core) return null;
  const before = input.slice(0, start);
  const after = input.slice(start + core.length);
  if (!before.trim() && !after.trim()) return null;
  return { before, core, after };
}

export function analyzeJson(json: string): DebugIssue[] {
  if (!json.trim()) return [];

  const duplicateKeyIssues = detectDuplicateKeys(json);

  try {
    JSON.parse(json);
    return duplicateKeyIssues; // valid JSON — only duplicate-key warnings (if any) apply
  } catch (e: unknown) {
    const issues: DebugIssue[] = [...duplicateKeyIssues];
    const trimmed = json.trim();

    // Wrapper problems (markdown fence / prose around the JSON) are diagnosed on
    // their own — fixing them is a single extraction step, and re-running the
    // debugger afterward will surface anything still wrong with the inner JSON.
    if (FENCE_RE.test(trimmed)) {
      issues.unshift({
        id: "markdown-fence",
        line: 1,
        col: 1,
        length: 3,
        severity: "warning",
        type: "markdown-fence",
        title: "Markdown code fence detected",
        message: "This looks like JSON wrapped in a ``` code fence. JSON Prism can extract it automatically.",
        autoFixable: true,
      });
      return issues;
    }

    const surrounding = findSurroundingText(json);
    if (surrounding) {
      const { line, col } = lineColAt(json, json.indexOf(surrounding.core));
      issues.unshift({
        id: "surrounding-text",
        line,
        col,
        length: 1,
        severity: "warning",
        type: "surrounding-text",
        title: "Text surrounding JSON detected",
        message: "There's extra text before or after the JSON block. JSON Prism can extract just the JSON.",
        autoFixable: true,
      });
      return issues;
    }

    // Extract native error info as a fallback / last resort.
    const errMsg = e instanceof SyntaxError ? e.message : String(e);
    const posMatch = errMsg.match(/position (\d+)/);
    let nativeLine = 1;
    let nativeCol = 1;
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      ({ line: nativeLine, col: nativeCol } = lineColAt(json, pos));
    }

    // Detect trailing commas
    const trailingCommaRe = /,(\s*[}\]])/g;
    let m: RegExpExecArray | null;
    while ((m = trailingCommaRe.exec(json)) !== null) {
      const { line, col } = lineColAt(json, m.index);
      issues.push({
        id: `trailing-comma-${line}-${col}`,
        line,
        col,
        length: 1,
        severity: "error",
        type: "trailing-comma",
        title: "Trailing comma",
        message: `This comma isn't allowed before the closing ${m[1].trim()}.`,
        autoFixable: true,
      });
    }

    // Detect unclosed brackets
    const brackets: Array<{ ch: string; line: number; col: number }> = [];
    let inString = false;
    let escaped = false;
    let lineNum = 1;
    let lineStart = 0;
    for (let i = 0; i < json.length; i++) {
      const ch = json[i];
      if (ch === "\n") {
        lineNum++;
        lineStart = i + 1;
        continue;
      }
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\" && inString) {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{" || ch === "[") brackets.push({ ch, line: lineNum, col: i - lineStart + 1 });
      else if (ch === "}" || ch === "]") {
        const last = brackets[brackets.length - 1];
        if (last && ((ch === "}" && last.ch === "{") || (ch === "]" && last.ch === "["))) {
          brackets.pop();
        }
      }
    }
    for (const b of brackets) {
      issues.push({
        id: `unclosed-bracket-${b.line}-${b.col}`,
        line: b.line,
        col: b.col,
        length: 1,
        severity: "error",
        type: "unclosed-bracket",
        title: "Unclosed bracket",
        message: `Expected a matching ${b.ch === "{" ? "}" : "]"} for the ${b.ch === "{" ? "object {" : "array ["} opened here.`,
        autoFixable: true,
      });
    }

    // Detect unquoted keys / single-quoted strings on a string-masked copy so we
    // don't false-positive on identifiers or apostrophes inside real strings.
    const masked = maskDoubleQuotedStrings(json);
    issues.push(...detectUnquotedKeys(json, masked));
    issues.push(...detectSingleQuotedStrings(json, masked));

    // If nothing more specific was found, fall back to a humanized native error.
    // Whether it's auto-fixable depends on whether jsonrepair can actually salvage it.
    if (issues.length === duplicateKeyIssues.length) {
      let fixable = false;
      try {
        JSON.parse(repairJson(json));
        fixable = true;
      } catch {
        /* not automatically repairable */
      }
      issues.push({
        id: `syntax-${nativeLine}-${nativeCol}`,
        line: nativeLine,
        col: nativeCol,
        length: 1,
        severity: "error",
        type: "syntax",
        title: "Syntax error",
        message: humanizeError(errMsg),
        autoFixable: fixable,
      });
    }

    return issues;
  }
}

function humanizeError(msg: string): string {
  if (msg.includes("Unexpected token")) {
    const tokenMatch = msg.match(/Unexpected token ['"]?(.+?)['"]?\s/);
    const token = tokenMatch ? `'${tokenMatch[1]}'` : "an unexpected character";
    return `Unexpected token ${token} — likely a missing comma, quote, or bracket`;
  }
  if (msg.includes("Unexpected end")) return "JSON ends prematurely — check for unclosed brackets or missing values";
  if (msg.includes("Expected")) return msg.replace(/JSON\.parse:|at position \d+/g, "").trim();
  return msg;
}

/**
 * Repair invalid JSON. Delegates to the `jsonrepair` library for most cases
 * (missing brackets, commas, colons, quotes, comments, NDJSON→array, etc.),
 * but handles "JSON embedded in surrounding prose" itself first — jsonrepair
 * treats stray text as string content and wraps everything in an array
 * instead of discarding it.
 * @see https://github.com/josdejong/jsonrepair
 */
export function repairJson(input: string): string {
  assertInputBudget(input);
  const s = input.trim();
  if (!s) return s;
  if (FENCE_RE.test(s)) return jsonrepair(s); // jsonrepair strips fences natively
  const surrounding = findSurroundingText(s);
  if (surrounding) return jsonrepair(surrounding.core);
  return jsonrepair(s);
}

export function applyAutoFix(json: string): string {
  return repairJson(json);
}

/** Groups fixable issues by type into human-readable change lines, e.g.
 *  "Removed 2 trailing commas". Used by the fix-preview dialog and the
 *  post-fix "what changed" summary. */
export function summarizeFixes(issues: DebugIssue[]): string[] {
  const verbs: Partial<Record<IssueType, string>> = {
    "trailing-comma": "Removed",
    "unclosed-bracket": "Added",
    "unquoted-key": "Quoted",
    "single-quote": "Converted",
    "markdown-fence": "Removed",
    "surrounding-text": "Extracted JSON from",
  };
  const counts = new Map<IssueType, number>();
  for (const issue of issues) {
    if (!issue.autoFixable) continue;
    counts.set(issue.type, (counts.get(issue.type) ?? 0) + 1);
  }
  const lines: string[] = [];
  for (const [type, count] of counts) {
    const verb = verbs[type] ?? "Fixed";
    const label = count === 1 ? ISSUE_TYPE_LABELS[type].singular : ISSUE_TYPE_LABELS[type].plural;
    lines.push(`${verb} ${count} ${label}`);
  }
  return lines;
}
