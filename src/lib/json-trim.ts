export function extractPath(parsed: unknown, path: string): unknown {
  if (!path.trim()) return parsed;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let current: unknown = parsed;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function firstN(parsed: unknown, n: number): unknown {
  if (Array.isArray(parsed)) return parsed.slice(0, n);
  if (parsed && typeof parsed === "object") {
    const entries = Object.entries(parsed as object).slice(0, n);
    return Object.fromEntries(entries);
  }
  return parsed;
}

export function removeKeys(parsed: unknown, keys: string[]): unknown {
  if (keys.length === 0) return parsed;
  if (Array.isArray(parsed)) return parsed.map(item => removeKeys(item, keys));
  if (parsed && typeof parsed === "object" && parsed !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed as object)) {
      if (!keys.includes(k)) result[k] = removeKeys(v, keys);
    }
    return result;
  }
  return parsed;
}

export function collapseDepth(parsed: unknown, maxDepth: number, current = 0): unknown {
  if (current >= maxDepth) {
    if (Array.isArray(parsed)) return `[Array(${parsed.length})]`;
    if (parsed && typeof parsed === "object") return `{Object(${Object.keys(parsed as object).length} keys)}`;
    return parsed;
  }
  if (Array.isArray(parsed)) return parsed.map(item => collapseDepth(item, maxDepth, current + 1));
  if (parsed && typeof parsed === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed as object)) {
      result[k] = collapseDepth(v, maxDepth, current + 1);
    }
    return result;
  }
  return parsed;
}

export function getAllKeys(parsed: unknown, depth = 0, maxDepth = 2): string[] {
  if (depth > maxDepth) return [];
  const keys: string[] = [];
  if (Array.isArray(parsed)) {
    for (const item of parsed.slice(0, 10)) {
      keys.push(...getAllKeys(item, depth + 1, maxDepth));
    }
  } else if (parsed && typeof parsed === "object") {
    for (const [k, v] of Object.entries(parsed as object)) {
      keys.push(k);
      keys.push(...getAllKeys(v, depth + 1, maxDepth));
    }
  }
  return [...new Set(keys)];
}
