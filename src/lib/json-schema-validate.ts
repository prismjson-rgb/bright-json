import Ajv from "ajv";
import Ajv2020 from "ajv/dist/2020";
import { parseJsonSafe } from "./precise-json";
import type { ValidationResult } from "./schema-result";
export { errorPath, type ValidationResult, type ValidationStatus } from "./schema-result";

/** Validates jsonStr against schemaStr. Both must be non-empty strings. */
export function validateJsonAgainstSchema(jsonStr: string, schemaStr: string): ValidationResult {
  if (!schemaStr.trim() || !jsonStr.trim()) {
    return { status: "idle", errors: [] };
  }

  let schema: unknown;
  try {
    if (schemaStr.length > 100_000) throw new Error("Schema exceeds the 100,000 character limit.");
    schema = parseJsonSafe(schemaStr);
  } catch (e) {
    return { status: "schema-error", errors: [], schemaErrorMsg: (e as Error).message };
  }

  let data: unknown;
  try {
    data = parseJsonSafe(jsonStr);
  } catch {
    return { status: "json-error", errors: [] };
  }

  try {
    const dialect = schema && typeof schema === "object" ? (schema as Record<string, unknown>).$schema : undefined;
    const Validator = dialect === "https://json-schema.org/draft/2020-12/schema" ? Ajv2020 : Ajv;
    const ajv = new Validator({ allErrors: true, strict: false, validateSchema: true });
    const validate = ajv.compile(schema as object);
    const valid = validate(data);
    return { status: valid ? "valid" : "invalid", errors: (validate.errors ?? []).slice(0, 100) };
  } catch (e) {
    return { status: "schema-error", errors: [], schemaErrorMsg: (e as Error).message };
  }
}
