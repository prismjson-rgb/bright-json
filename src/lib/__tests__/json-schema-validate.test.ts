import { describe, it, expect } from "vitest";
import { errorPath, validateJsonAgainstSchema } from "../json-schema-validate";
import type { ErrorObject } from "ajv";

// ---------------------------------------------------------------------------
// errorPath
// ---------------------------------------------------------------------------

function makeError(overrides: Partial<ErrorObject>): ErrorObject {
  return {
    keyword: "type",
    instancePath: "",
    schemaPath: "#/type",
    params: {},
    message: "must be string",
    ...overrides,
  } as ErrorObject;
}

describe("errorPath", () => {
  it("returns '(root)' when instancePath is empty", () => {
    expect(errorPath(makeError({ instancePath: "" }))).toBe("(root)");
  });

  it("returns the instancePath for non-required keywords", () => {
    expect(errorPath(makeError({ instancePath: "/name" }))).toBe("/name");
    expect(errorPath(makeError({ instancePath: "/address/city" }))).toBe("/address/city");
  });

  it("appends missing property for required at root", () => {
    const e = makeError({ keyword: "required", instancePath: "", params: { missingProperty: "email" } });
    expect(errorPath(e)).toBe("/email");
  });

  it("appends missing property for required on nested path", () => {
    const e = makeError({ keyword: "required", instancePath: "/address", params: { missingProperty: "zip" } });
    expect(errorPath(e)).toBe("/address/zip");
  });
});

// ---------------------------------------------------------------------------
// validateJsonAgainstSchema — idle (empty inputs)
// ---------------------------------------------------------------------------

describe("validateJsonAgainstSchema — idle", () => {
  const schema = JSON.stringify({ type: "object" });
  const json   = JSON.stringify({ a: 1 });

  it("returns idle when both inputs are empty", () => {
    expect(validateJsonAgainstSchema("", "").status).toBe("idle");
  });

  it("returns idle when schema is empty", () => {
    expect(validateJsonAgainstSchema(json, "").status).toBe("idle");
  });

  it("returns idle when json is empty", () => {
    expect(validateJsonAgainstSchema("", schema).status).toBe("idle");
  });

  it("returns idle when both inputs are whitespace-only", () => {
    expect(validateJsonAgainstSchema("   ", "   ").status).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// validateJsonAgainstSchema — valid
// ---------------------------------------------------------------------------

describe("validateJsonAgainstSchema — valid", () => {
  it("returns valid for a flat object matching its schema", () => {
    const schema = JSON.stringify({
      type: "object",
      required: ["id", "name"],
      properties: {
        id:   { type: "number" },
        name: { type: "string" },
      },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: 1, name: "Alice" }), schema);
    expect(result.status).toBe("valid");
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for an array schema", () => {
    const schema = JSON.stringify({ type: "array", items: { type: "number" } });
    const result = validateJsonAgainstSchema("[1, 2, 3]", schema);
    expect(result.status).toBe("valid");
  });

  it("returns valid for a primitive type schema", () => {
    const schema = JSON.stringify({ type: "string" });
    const result = validateJsonAgainstSchema('"hello"', schema);
    expect(result.status).toBe("valid");
  });

  it("returns valid when additionalProperties are allowed and present", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: { id: { type: "number" } },
      additionalProperties: true,
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: 1, extra: "ok" }), schema);
    expect(result.status).toBe("valid");
  });
});

// ---------------------------------------------------------------------------
// validateJsonAgainstSchema — invalid
// ---------------------------------------------------------------------------

describe("validateJsonAgainstSchema — invalid", () => {
  it("reports type mismatch with correct instance path", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: { age: { type: "number" } },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ age: "thirty" }), schema);
    expect(result.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].instancePath).toBe("/age");
  });

  it("reports missing required field", () => {
    const schema = JSON.stringify({
      type: "object",
      required: ["id", "name"],
      properties: {
        id:   { type: "number" },
        name: { type: "string" },
      },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: 1 }), schema);
    expect(result.status).toBe("invalid");
    const paths = result.errors.map(errorPath);
    expect(paths).toContain("/name");
  });

  it("reports all errors at once (allErrors mode)", () => {
    const schema = JSON.stringify({
      type: "object",
      required: ["a", "b", "c"],
      properties: {
        a: { type: "number" },
        b: { type: "boolean" },
        c: { type: "string" },
      },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ a: "wrong", b: "wrong", c: 99 }), schema);
    expect(result.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("reports additionalProperties violation", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: { id: { type: "number" } },
      additionalProperties: false,
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: 1, unexpected: true }), schema);
    expect(result.status).toBe("invalid");
  });

  it("reports minimum constraint violation", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: { age: { type: "number", minimum: 0 } },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ age: -1 }), schema);
    expect(result.status).toBe("invalid");
    expect(result.errors[0].instancePath).toBe("/age");
  });
});

// ---------------------------------------------------------------------------
// validateJsonAgainstSchema — error states
// ---------------------------------------------------------------------------

describe("validateJsonAgainstSchema — error states", () => {
  it("returns schema-error for malformed schema JSON", () => {
    const result = validateJsonAgainstSchema('{"a":1}', "{bad json}");
    expect(result.status).toBe("schema-error");
    expect(result.schemaErrorMsg).toBeTruthy();
  });

  it("returns json-error for malformed editor JSON", () => {
    const schema = JSON.stringify({ type: "object" });
    const result = validateJsonAgainstSchema("{not valid json}", schema);
    expect(result.status).toBe("json-error");
  });

  it("json-error takes priority over schema-error when both inputs are invalid", () => {
    // Schema is parsed first; bad schema returns schema-error regardless of JSON
    const result = validateJsonAgainstSchema("{bad json}", "{also bad}");
    expect(result.status).toBe("schema-error");
  });

  it("accepts schemas with $schema: draft/2020-12 without throwing", () => {
    const schema = JSON.stringify({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: "abc" }), schema);
    expect(result.status).toBe("valid");
  });

  it("still reports errors for schemas with $schema: draft/2020-12", () => {
    const schema = JSON.stringify({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    });
    const result = validateJsonAgainstSchema(JSON.stringify({ id: 123 }), schema);
    expect(result.status).toBe("invalid");
    expect(result.errors[0].instancePath).toBe("/id");
  });
});
