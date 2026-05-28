import Ajv, { type ErrorObject } from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });

export type ValidationStatus = "idle" | "valid" | "invalid" | "schema-error" | "json-error";

export interface ValidationResult {
  status: ValidationStatus;
  errors: ErrorObject[];
  schemaErrorMsg?: string;
}

/** Derives a human-readable JSON path from an ajv ErrorObject. */
export function errorPath(e: ErrorObject): string {
  const path = e.instancePath || "(root)";
  if (e.keyword === "required") {
    const missing = (e.params as { missingProperty?: string }).missingProperty ?? "";
    return path === "(root)" ? `/${missing}` : `${path}/${missing}`;
  }
  return path;
}

/** Validates jsonStr against schemaStr. Both must be non-empty strings. */
export function validateJsonAgainstSchema(jsonStr: string, schemaStr: string): ValidationResult {
  if (!schemaStr.trim() || !jsonStr.trim()) {
    return { status: "idle", errors: [] };
  }

  let schema: unknown;
  try {
    schema = JSON.parse(schemaStr);
  } catch (e) {
    return { status: "schema-error", errors: [], schemaErrorMsg: (e as Error).message };
  }

  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    return { status: "json-error", errors: [] };
  }

  try {
    const validate = ajv.compile(schema as object);
    const valid = validate(data);
    return { status: valid ? "valid" : "invalid", errors: validate.errors ?? [] };
  } catch (e) {
    return { status: "schema-error", errors: [], schemaErrorMsg: (e as Error).message };
  }
}
