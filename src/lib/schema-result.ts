import type { ErrorObject } from "ajv";
export type ValidationStatus = "idle" | "processing" | "valid" | "invalid" | "schema-error" | "json-error";
export interface ValidationResult {
  status: ValidationStatus;
  errors: ErrorObject[];
  schemaErrorMsg?: string;
}
export function errorPath(e: ErrorObject): string {
  const path = e.instancePath || "(root)";
  if (e.keyword === "required") {
    const missing = String(e.params.missingProperty ?? "");
    return path === "(root)" ? `/${missing}` : `${path}/${missing}`;
  }
  return path;
}
