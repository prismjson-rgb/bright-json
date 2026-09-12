export interface DiffLine {
  type: "same" | "add" | "remove";
  text: string;
}

/** Line-level LCS diff. Falls back to a coarse remove-all/add-all split for
 *  inputs too large for the O(n*m) DP table to stay cheap. */
export function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const n = aLines.length;
  const m = bLines.length;

  if (n * m > 500_000) {
    return [
      ...aLines.map((text): DiffLine => ({ type: "remove", text })),
      ...bLines.map((text): DiffLine => ({ type: "add", text })),
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      result.push({ type: "same", text: aLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "remove", text: aLines[i] });
      i++;
    } else {
      result.push({ type: "add", text: bLines[j] });
      j++;
    }
  }
  while (i < n) result.push({ type: "remove", text: aLines[i++] });
  while (j < m) result.push({ type: "add", text: bLines[j++] });
  return result;
}

export type CompactDiffRow = DiffLine | { type: "gap" };

/** Collapses long unchanged runs down to `context` lines around each change,
 *  inserting a "gap" marker for anything hidden — keeps the preview short for
 *  large documents where only a couple of lines actually changed. */
export function compactDiff(lines: DiffLine[], context = 1): CompactDiffRow[] {
  const keep = new Array(lines.length).fill(false);
  lines.forEach((l, idx) => {
    if (l.type !== "same") {
      for (let k = Math.max(0, idx - context); k <= Math.min(lines.length - 1, idx + context); k++) keep[k] = true;
    }
  });

  const out: CompactDiffRow[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!keep[i]) {
      out.push({ type: "gap" });
      while (i < lines.length && !keep[i]) i++;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out;
}
