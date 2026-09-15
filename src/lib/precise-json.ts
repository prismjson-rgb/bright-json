import { isSafeNumber } from "lossless-json";
import { assertInputBudget } from "./input-limits";

export const PRECISION_MESSAGE = "This document contains numbers that JavaScript cannot represent safely. Format, minify, sort, copy and export preserve them; numerical views and conversions are disabled. Use quoted strings for IDs if you need those tools.";

/** Only exposes ordinary numbers to tools when no numeric information is lost. */
export function parseJsonSafe(text: string): any {
  assertInputBudget(text);
  // Keep native syntax diagnostics and duplicate-key semantics for existing tools.
  const result = JSON.parse(text);
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) ?? [];
  for (const token of tokens) {
    if (token[0] !== '"' && (!isSafeNumber(token) || (Number.isInteger(Number(token)) && !Number.isSafeInteger(Number(token))))) {
      throw new Error(PRECISION_MESSAGE);
    }
  }
  return result;
}

/** Format validated lexical tokens. Never convert numeric values or assign user keys. */
export function formatJsonPrecisely(text: string, indent = 2, sortKeys = false): string {
  assertInputBudget(text);
  JSON.parse(text); // Syntax validation only; this rounded result is never used.
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g)!;
  let position = 0;
  const width = Math.max(0, Math.min(10, Math.floor(indent)));
  const pad = (depth: number) => " ".repeat(width * depth);
  const render = (depth: number): string => {
    const token = tokens[position++];
    if (token !== "{" && token !== "[") return token;
    const close = token === "{" ? "}" : "]";
    const entries: { key: string; value: string }[] = [];
    while (tokens[position] !== close) {
      let key = "";
      if (token === "{") { key = tokens[position++]; position++; }
      const value = render(depth + 1);
      entries.push({ key, value });
      if (tokens[position] === ",") position++;
    }
    position++;
    if (!entries.length) return token + close;
    if (sortKeys && token === "{") entries.sort((a, b) => {
      const left = JSON.parse(a.key), right = JSON.parse(b.key);
      return left < right ? -1 : left > right ? 1 : 0;
    });
    const body = entries.map(({ key, value }) => (width ? pad(depth + 1) : "") + (key ? key + (width ? ": " : ":") : "") + value).join(width ? ",\n" : ",");
    return token + (width ? "\n" : "") + body + (width ? "\n" + pad(depth) : "") + close;
  };
  return render(0);
}
