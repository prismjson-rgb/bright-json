import { useMemo } from "react";
import { analyzeJson, type JsonStructure } from "@/lib/json-analyze";

export function useJsonAnalyze(parsed: unknown): JsonStructure | null {
  return useMemo(() => {
    if (parsed === null || parsed === undefined) return null;
    return analyzeJson(parsed);
  }, [parsed]);
}
