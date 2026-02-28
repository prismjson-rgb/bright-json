export interface JsonStructure {
  totalKeys: number;
  totalValues: number;
  maxDepth: number;
  typeDistribution: Record<string, number>;
  arrayCount: number;
  objectCount: number;
  nullCount: number;
  longestKey: string;
  longestKeyLength: number;
  totalSize: number; // in bytes
}

export function analyzeJson(parsed: unknown): JsonStructure {
  const stats: JsonStructure = {
    totalKeys: 0, totalValues: 0, maxDepth: 0,
    typeDistribution: { string: 0, number: 0, boolean: 0, null: 0, array: 0, object: 0 },
    arrayCount: 0, objectCount: 0, nullCount: 0,
    longestKey: "", longestKeyLength: 0, totalSize: 0,
  };

  function walk(node: unknown, depth: number) {
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    if (Array.isArray(node)) {
      stats.arrayCount++;
      stats.typeDistribution.array++;
      for (const item of node) walk(item, depth + 1);
    } else if (node === null) {
      stats.nullCount++;
      stats.totalValues++;
      stats.typeDistribution.null++;
    } else if (typeof node === "object") {
      stats.objectCount++;
      stats.typeDistribution.object++;
      for (const [k, v] of Object.entries(node as object)) {
        stats.totalKeys++;
        if (k.length > stats.longestKeyLength) { stats.longestKey = k; stats.longestKeyLength = k.length; }
        walk(v, depth + 1);
      }
    } else {
      stats.totalValues++;
      const t = typeof node;
      if (t === "string" || t === "number" || t === "boolean") {
        stats.typeDistribution[t] = (stats.typeDistribution[t] || 0) + 1;
      }
    }
  }

  walk(parsed, 0);
  stats.totalSize = new TextEncoder().encode(JSON.stringify(parsed)).length;
  return stats;
}
