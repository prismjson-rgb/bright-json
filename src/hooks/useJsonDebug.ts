import { useMemo } from "react";
import { analyzeJson, type DebugIssue } from "@/lib/json-debug";

export function useJsonDebug(json: string): DebugIssue[] {
  return useMemo(() => analyzeJson(json), [json]);
}
