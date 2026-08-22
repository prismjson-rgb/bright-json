---
title: "Validating LLM JSON Against a Schema"
metaTitle: "Validate LLM JSON Output Against a Schema"
metaDescription: "Even valid JSON from an LLM can have the wrong shape. Learn how to validate model output against a JSON Schema so bad data never reaches your app."
level: intermediate
order: 37
keyTerms: [validate json, json schema, llm output, ajv, pydantic]
relatedTools: [json-validator, ai-json-cleaner]
relatedLearn: [json-schema-basics, reliable-json-from-llms, fixing-llm-json]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Parsing LLM output only proves it's *valid JSON* — not that it has the **fields and types your app expects**. Validate the parsed object against a **JSON Schema** (or a Zod/Pydantic model) so missing keys, wrong types, and stray fields are caught at the boundary instead of crashing code three layers deep. Check a sample document and schema together in the [JSON Validator](/tools/json-validator/).

## Why "it parsed" isn't enough

A model can return perfectly valid JSON that's still wrong for you:

```json
{ "name": "Ada", "age": "thirty-six" }
```

That parses fine. But `age` is a string, not a number — and if your code does `user.age + 1`, you get `"thirty-six1"`, a silent bug. Other common shape problems from LLMs:

- A required field is **missing** (`email` never appeared).
- A field is `null` when your code assumed a value — see [null vs missing](/learn/json-null-vs-missing/).
- An **extra** field the model invented.
- An array where you expected an object, or vice versa.

Validation turns all of these into a clear, early failure.

## Validate against a schema

Define the expected shape once and check every response against it:

```js
import Ajv from "ajv";

const ajv = new Ajv();
const schema = {
  type: "object",
  required: ["name", "age"],
  properties: {
    name: { type: "string" },
    age: { type: "integer", minimum: 0 },
    active: { type: "boolean" },
  },
  additionalProperties: false,
};

const validate = ajv.compile(schema);
if (!validate(data)) {
  console.error(validate.errors);   // exactly what's wrong, and where
}
```

`additionalProperties: false` rejects fields the model shouldn't have added; `required` catches omissions; the `type` keywords catch `"thirty-six"`. For the schema language itself, see [JSON Schema Basics](/learn/json-schema-basics/).

In Python, a Pydantic model does the same job — `Person.model_validate(data)` raises a precise error listing every field that's off.

## Build it into the pipeline

A robust LLM-to-JSON flow has three stages:

1. **Constrain** generation with structured output so most responses are already valid — see [Getting Reliable JSON from LLMs](/learn/reliable-json-from-llms/).
2. **Clean** any stragglers (fences, truncation) with the [AI JSON Cleaner](/tools/ai-json-cleaner/).
3. **Validate** the parsed object against your schema before it touches business logic.

When validation fails, you can re-prompt the model with the validation errors ("the previous response was missing `email`"), which often fixes it on the second try. The [JSON Best Practices Checker](/tools/json-best-practices-checker/) can also flag structural smells beyond strict schema rules.

## Frequently asked questions

**Why validate LLM JSON if it already parses?**
Parsing only confirms valid syntax. It doesn't confirm the object has the required fields, correct types, or no extra keys — all of which a model can get wrong while producing valid JSON.

**What's the best way to validate the shape?**
Define a JSON Schema (or a Zod/Pydantic model) and validate each response against it. You get a precise list of what's missing or mistyped, at the boundary of your system.

**How do I catch wrong types like a string instead of a number?**
A schema's `type` keyword does exactly this — `"age": { "type": "integer" }` rejects `"thirty-six"`. Validators like Ajv or Pydantic report the offending field.

**What should I do when validation fails?**
Log the specific errors, and optionally re-prompt the model with them so it can correct the response. Don't let unvalidated data flow into the rest of your app.
