import { describe, it, expect } from "vitest";
import { inferType, inferFieldsFromJson } from "../json-mock";

// ---------------------------------------------------------------------------
// inferType
// ---------------------------------------------------------------------------

describe("inferType", () => {
  it("returns 'boolean' for true/false", () => {
    expect(inferType(true)).toBe("boolean");
    expect(inferType(false)).toBe("boolean");
  });

  it("returns 'number' for integers and floats", () => {
    expect(inferType(42)).toBe("number");
    expect(inferType(3.14)).toBe("number");
    expect(inferType(0)).toBe("number");
    expect(inferType(-99)).toBe("number");
  });

  it("returns 'uuid' for UUID-shaped strings", () => {
    expect(inferType("f6472650-130c-4afd-a60e-4e35893bc2e5")).toBe("uuid");
    expect(inferType("00000000-0000-4000-8000-000000000000")).toBe("uuid");
  });

  it("returns 'email' for strings containing @", () => {
    expect(inferType("alice@example.com")).toBe("email");
    expect(inferType("user+tag@domain.co.uk")).toBe("email");
  });

  it("returns 'date' for ISO-date-prefixed strings", () => {
    expect(inferType("2024-01-15T10:30:00.000Z")).toBe("date");
    expect(inferType("2023-12-31")).toBe("date");
  });

  it("returns 'string' for plain strings", () => {
    expect(inferType("hello")).toBe("string");
    expect(inferType("New York")).toBe("string");
    expect(inferType("")).toBe("string");
  });

  it("returns null for objects, arrays, and null", () => {
    expect(inferType(null)).toBeNull();
    expect(inferType({})).toBeNull();
    expect(inferType([])).toBeNull();
    expect(inferType({ a: 1 })).toBeNull();
    expect(inferType([1, 2, 3])).toBeNull();
  });

  it("UUID detection is case-insensitive", () => {
    expect(inferType("F6472650-130C-4AFD-A60E-4E35893BC2E5")).toBe("uuid");
  });

  it("does not confuse a partial UUID pattern as uuid", () => {
    expect(inferType("f6472650-130c")).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// inferFieldsFromJson — flat object
// ---------------------------------------------------------------------------

describe("inferFieldsFromJson — flat object", () => {
  it("infers all scalar field types from a flat object", () => {
    const json = JSON.stringify({
      id: "f6472650-130c-4afd-a60e-4e35893bc2e5",
      name: "Alice",
      email: "alice@example.com",
      age: 30,
      active: true,
      createdAt: "2024-01-15T10:30:00.000Z",
    });
    const fields = inferFieldsFromJson(json);
    expect(fields).toEqual([
      { name: "id",        type: "uuid"    },
      { name: "name",      type: "string"  },
      { name: "email",     type: "email"   },
      { name: "age",       type: "number"  },
      { name: "active",    type: "boolean" },
      { name: "createdAt", type: "date"    },
    ]);
  });

  it("skips nested objects", () => {
    const json = JSON.stringify({ id: "abc", address: { city: "NY" } });
    const fields = inferFieldsFromJson(json)!;
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("id");
  });

  it("skips arrays", () => {
    const json = JSON.stringify({ name: "Alice", tags: ["a", "b"] });
    const fields = inferFieldsFromJson(json)!;
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("name");
  });

  it("skips null values", () => {
    const json = JSON.stringify({ name: "Alice", optional: null });
    const fields = inferFieldsFromJson(json)!;
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("name");
  });
});

// ---------------------------------------------------------------------------
// inferFieldsFromJson — array input (uses first item)
// ---------------------------------------------------------------------------

describe("inferFieldsFromJson — array input", () => {
  it("uses the first element when root is an array", () => {
    const json = JSON.stringify([
      { id: 1, name: "Alice", active: true },
      { id: 2, name: "Bob",   active: false },
    ]);
    const fields = inferFieldsFromJson(json);
    expect(fields).toEqual([
      { name: "id",     type: "number"  },
      { name: "name",   type: "string"  },
      { name: "active", type: "boolean" },
    ]);
  });

  it("returns null for an empty array", () => {
    expect(inferFieldsFromJson("[]")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// inferFieldsFromJson — edge / error cases
// ---------------------------------------------------------------------------

describe("inferFieldsFromJson — edge cases", () => {
  it("returns null for invalid JSON", () => {
    expect(inferFieldsFromJson("not json")).toBeNull();
    expect(inferFieldsFromJson("{bad}")).toBeNull();
    expect(inferFieldsFromJson("")).toBeNull();
  });

  it("returns null for a JSON primitive (string root)", () => {
    expect(inferFieldsFromJson('"hello"')).toBeNull();
    expect(inferFieldsFromJson("42")).toBeNull();
    expect(inferFieldsFromJson("true")).toBeNull();
  });

  it("returns null for an object with no scalar fields", () => {
    const json = JSON.stringify({ nested: { a: 1 }, arr: [1, 2] });
    expect(inferFieldsFromJson(json)).toBeNull();
  });

  it("preserves field order from the source object", () => {
    const json = JSON.stringify({ z: "last", a: 1, m: true });
    const fields = inferFieldsFromJson(json)!;
    expect(fields.map(f => f.name)).toEqual(["z", "a", "m"]);
  });
});
