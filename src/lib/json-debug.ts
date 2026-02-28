export interface DebugIssue {
  line: number;
  col?: number;
  severity: "error" | "warning";
  type: "trailing-comma" | "unclosed-bracket" | "duplicate-key" | "syntax" | "unquoted-key";
  message: string;
  autoFixable: boolean;
}

export function analyzeJson(json: string): DebugIssue[] {
  if (!json.trim()) return [];

  // First try native parse
  try {
    JSON.parse(json);
    return []; // valid JSON
  } catch (e: unknown) {
    const issues: DebugIssue[] = [];
    const lines = json.split("\n");

    // Extract native error info
    const errMsg = e instanceof SyntaxError ? e.message : String(e);
    const posMatch = errMsg.match(/position (\d+)/);
    let nativeLine = 1, nativeCol = 1;
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      let count = 0;
      for (let i = 0; i < lines.length; i++) {
        if (count + lines[i].length + 1 > pos) {
          nativeLine = i + 1;
          nativeCol = pos - count + 1;
          break;
        }
        count += lines[i].length + 1;
      }
    }

    // Detect trailing commas
    const trailingCommaRe = /,(\s*[}\]])/g;
    let m;
    while ((m = trailingCommaRe.exec(json)) !== null) {
      const beforePos = json.slice(0, m.index).split("\n");
      const line = beforePos.length;
      issues.push({
        line,
        severity: "error",
        type: "trailing-comma",
        message: `Trailing comma before closing bracket on line ${line}`,
        autoFixable: true,
      });
    }

    // Detect unclosed brackets
    const brackets: Array<{ ch: string; line: number }> = [];
    let inString = false, escaped = false;
    let lineNum = 1;
    for (let i = 0; i < json.length; i++) {
      const ch = json[i];
      if (ch === "\n") { lineNum++; continue; }
      if (escaped) { escaped = false; continue; }
      if (ch === "\\" && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{" || ch === "[") brackets.push({ ch, line: lineNum });
      else if (ch === "}" || ch === "]") {
        const last = brackets[brackets.length - 1];
        if (last && ((ch === "}" && last.ch === "{") || (ch === "]" && last.ch === "["))) {
          brackets.pop();
        }
      }
    }
    for (const b of brackets) {
      issues.push({
        line: b.line,
        severity: "error",
        type: "unclosed-bracket",
        message: `Unclosed ${b.ch === "{" ? "object {" : "array ["} opened on line ${b.line}`,
        autoFixable: false,
      });
    }

    // Detect duplicate keys (simple heuristic)
    const objMatches: Array<{ key: string; index: number }> = [];
    const keyRe2 = /"([^"\\]*)"\s*:/g;
    let km;
    while ((km = keyRe2.exec(json)) !== null) {
      objMatches.push({ key: km[1], index: km.index });
    }

    // If there are 0 issues from the above checks, add the native syntax error
    if (issues.length === 0) {
      issues.push({
        line: nativeLine,
        col: nativeCol,
        severity: "error",
        type: "syntax",
        message: humanizeError(errMsg),
        autoFixable: false,
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

export function applyAutoFix(json: string): string {
  // Fix trailing commas
  const fixed = json.replace(/,(\s*[}\]])/g, "$1");
  return fixed;
}
