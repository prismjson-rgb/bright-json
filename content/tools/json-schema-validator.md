---
title: JSON Schema Validator
metaTitle: JSON Schema Validator | Validate JSON Against a Schema, Free
metaDescription: Validate JSON against a JSON Schema (Draft 7) with per-field error paths. 100% browser-based — nothing is uploaded, no signup.
summary: Check whether JSON satisfies a JSON Schema, not just whether it parses.
category: Schema
appHref: /app/?tool=json-schema-validator
badge: Validation
order: 2.5
keywords: [json schema validator, validate json against schema, json schema check, ajv validator, draft 7 schema]
relatedTools: [json-validator, json-best-practices-checker]
relatedLearn: [json-schema-basics, validate-llm-json-schema, valid-vs-invalid]
highlights:
  - Draft 7 JSON Schema support
  - Per-field error paths, not just pass/fail
  - Runs entirely in the browser via Ajv
useCases:
  - API contract enforcement
  - LLM structured-output validation
  - Config file schema checks
faqs:
  - question: "What is the difference between JSON validation and JSON Schema validation?"
    answer: "Plain JSON validation checks whether text is syntactically well-formed JSON — matched brackets, quoted keys, no trailing commas. JSON Schema validation goes further: it checks whether the data itself matches a contract — required fields, correct types, value ranges, string patterns. JSON can be syntactically valid and still fail schema validation, for example a payload missing a required 'id' field."
  - question: "What version of JSON Schema does this tool support?"
    answer: "JSON Schema Draft 7, validated with Ajv, the same validation engine used by many production Node.js and browser applications. Draft 7 covers the vast majority of real-world schemas, including type constraints, required properties, enums, patterns, and nested object/array validation."
  - question: "Can I use this to validate LLM output against a schema?"
    answer: "Yes. If you're using structured outputs, function calling, or tool-use JSON from an LLM, paste the model's JSON output on one side and your expected schema on the other. This catches cases where the model returns syntactically valid JSON that is still missing required fields or has the wrong types — a common failure mode with LLM structured output."
  - question: "Does the schema validator send my data to a server?"
    answer: "No. Both your JSON and your schema are validated entirely in your browser using Ajv running client-side. Nothing is uploaded, which makes it safe to validate schemas containing sensitive field names, internal API contracts, or proprietary data shapes."
---
Passing `JSON.parse()` only proves your JSON is syntactically well-formed — it says nothing about whether the data is *correct*. The JSON Schema Validator checks your JSON against a JSON Schema (Draft 7) contract: required fields, types, value ranges, string patterns, and nested structure. If a field is missing, the wrong type, or out of range, you get the exact field path and the reason, not just a red X.

## How to use the JSON Schema Validator

1. Paste or write your JSON Schema (Draft 7) in the schema panel — or click "Load sample" to see a working example.
2. Your JSON stays in the main editor, exactly like every other tool in the workspace.
3. Validation runs automatically on every keystroke in either panel.
4. If the JSON fails validation, each error shows the exact field path (e.g. `/user/email`) and what rule it broke.
5. Fix the JSON or adjust the schema until you see "JSON is valid against the schema."

## What it catches that plain validation doesn't

- **Missing required fields** — a payload that parses fine but is missing `id` or `email`
- **Wrong types** — a `"count"` field that's a string when the schema expects a number
- **Out-of-range values** — a `minimum`/`maximum` violation, like a negative `age`
- **Pattern mismatches** — a string that doesn't match a required regex (email format, UUID shape, etc.)
- **Unexpected shape** — nested objects or arrays that don't match the schema's structure

## Example: a schema and a JSON payload that fails it

**Schema** — requires `id` and `name`, with `age` constrained to non-negative:

```json
{
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0 }
  }
}
```

**JSON** — parses fine, but fails schema validation on two counts:

```json
{
  "name": "Dana",
  "age": -4
}
```

This JSON is syntactically valid — `JSON.parse()` accepts it without complaint. But it fails the schema: `id` is missing (required), and `age` is `-4`, violating `minimum: 0`. The Schema Validator reports both, with the exact field path for each.

## When to use it

**Enforcing an API contract** — before shipping a request or response shape, confirm every consumer's assumptions (required fields, types) actually hold, not just that the JSON parses.

**Validating LLM structured output** — models using function calling, tool use, or JSON mode can return syntactically valid JSON that's still missing a required field or has the wrong type. Schema validation is the difference between "it parsed" and "it's actually usable."

**Checking config files** — a typo'd config value (a string where a number is expected) often fails silently at runtime instead of at edit time. Validating against a schema catches it immediately.

**Onboarding a new API consumer** — hand them the schema alongside example payloads so they can self-validate before integration, instead of debugging against your live endpoint.

For the underlying concepts, see [JSON Schema — Structure Your Data](/learn/json-schema-basics/). If you're specifically validating LLM output, see [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/). For plain syntax validation without a schema, use the [JSON Validator](/tools/json-validator/).
