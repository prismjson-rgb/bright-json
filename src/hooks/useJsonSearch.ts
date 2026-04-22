"use client";
import { useState, useMemo, useCallback } from "react";

export interface SearchMatch {
  path: string;
  type: "key" | "value";
  matchedText: string;
}

function findMatches(
  data: unknown,
  query: string,
  path = "root",
  results: SearchMatch[] = []
): SearchMatch[] {
  if (!query) return results;
  const lq = query.toLowerCase();

  if (Array.isArray(data)) {
    data.forEach((item, i) => {
      findMatches(item, query, `${path}[${i}]`, results);
    });
  } else if (data !== null && typeof data === "object") {
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const childPath = `${path}.${key}`;
      if (key.toLowerCase().includes(lq)) {
        results.push({ path: childPath, type: "key", matchedText: key });
      }
      findMatches(val, query, childPath, results);
    }
  } else if (data !== null) {
    const strVal = String(data);
    if (strVal.toLowerCase().includes(lq)) {
      results.push({ path, type: "value", matchedText: strVal });
    }
  }

  return results;
}

export function useJsonSearch(parsed: unknown) {
  const [query, setQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!query.trim() || parsed === null || parsed === undefined) return [];
    return findMatches(parsed, query.trim());
  }, [parsed, query]);

  const matchPaths = useMemo(
    () => new Set(matches.map((m) => m.path)),
    [matches]
  );

  const safeIndex = matches.length === 0 ? 0 : currentMatchIndex % matches.length;
  const currentMatch = matches[safeIndex] ?? null;

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const handleSetQuery = useCallback((q: string) => {
    setQuery(q);
    setCurrentMatchIndex(0);
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    matches,
    matchCount: matches.length,
    matchPaths,
    currentMatchIndex: safeIndex,
    currentMatch,
    nextMatch,
    prevMatch,
  };
}
