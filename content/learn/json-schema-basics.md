---
title: JSON Schema — Structure Your Data
level: intermediate
order: 12
metaTitle: "JSON Schema Tutorial: Validate and Define JSON Structure"
metaDescription: "JSON Schema defines and validates JSON structure. Learn type checking, required fields, patterns, and validation tools."
keyTerms: []
relatedTools: [json-validator, json-best-practices-checker]
relatedLearn: [validate-llm-json-schema, common-patterns, valid-vs-invalid]
publishedAt: "2025-12-10"
---

JSON Schema is a vocabulary for annotating and validating JSON documents. It lets you define the exact structure your JSON must follow — which properties are required, what types they must be, what values are valid — and then automatically validate data against those rules. Think of it as a type system for JSON that works across every programming language.

## Why use JSON Schema?

Without a schema, you discover data problems at runtime — a missing field causes a null pointer exception, an unexpected string breaks a calculation. JSON Schema moves this check earlier:

- Validate API request bodies before processing them
- Validate API responses in tests to catch schema drift
- Generate documentation and TypeScript types from a single source of truth
- Enable autocomplete in editors that understand JSON Schema (VS Code does)

## Basic schema structure

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "number", "minimum": 0},
    "email": {"type": "string", "format": "email"}
  },
  "required": ["name", "email"]
}
```

This schema says: the data must be an object, it must have `name` (string) and `email` (string in email format), and `age` is optional but must be a non-negative number if present.

## Key schema keywords

| Keyword | Purpose |
|---------|---------|
| `type` | Value type: string, number, integer, boolean, null, object, array |
| `properties` | Define allowed keys and their schemas |
| `required` | List of keys that must be present |
| `minimum` / `maximum` | Numeric bounds |
| `minLength` / `maxLength` | String length bounds |
| `pattern` | Regex pattern a string must match |
| `enum` | List of allowed values |
| `format` | Semantic format: email, uri, date, date-time |
| `items` | Schema for array elements |
| `additionalProperties` | Whether unknown keys are allowed |

## A more complete example

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": {"type": "integer", "minimum": 1},
    "username": {"type": "string", "minLength": 3, "maxLength": 32},
    "email": {"type": "string", "format": "email"},
    "role": {"type": "string", "enum": ["admin", "editor", "viewer"]},
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "maxItems": 10
    },
    "createdAt": {"type": "string", "format": "date-time"}
  },
  "required": ["id", "username", "email", "role"],
  "additionalProperties": false
}
```

`additionalProperties: false` means any key not listed in `properties` will cause a validation failure — useful for strict API contracts.

## Validating data against a schema in JavaScript

```javascript
// Using Ajv (the most popular JSON Schema validator)
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  console.log(validate.errors);
}
```

## JSON Schema in other languages

- Python: `jsonschema` library (`pip install jsonschema`)
- Go: `gojsonschema` or `santhosh-tekuri/jsonschema`
- Java: `json-schema-validator` (Everit or networknt)
- PHP: `justinrainbow/json-schema`

## Try it in JSON Prism

The [JSON Best Practices Checker](/tools/json-best-practices-checker/) analyzes your JSON for structural problems without requiring you to write a schema. For a visual breakdown of your JSON's structure — types, depths, key frequency — use the [JSON Structure Analyzer](/tools/json-structure-analyzer/).
