import { assertInputBudget } from "@/lib/input-limits";
import { useMemo } from "react";
import { analyzeJson, type DebugIssue } from "@/lib/json-debug";

export function useJsonDebug(json: string): DebugIssue[] {
  return useMemo(() => { try { assertInputBudget(json); return analyzeJson(json); } catch { return []; } }, [json]);
}
