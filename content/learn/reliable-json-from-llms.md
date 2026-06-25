---
title: "Getting Reliable JSON from LLMs"
metaTitle: "Get Reliable JSON from LLMs (Structured Output)"
metaDescription: "Stop parsing LLM JSON with regex. Learn how JSON mode, structured outputs, and schema constraints make models return valid JSON every time."
level: intermediate
order: 36
keyTerms: [structured output, json mode, llm json, schema, function calling]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** The reliable way to get JSON from an LLM is to **constrain the output at generation time** — use the provider's *structured output* or *JSON mode* with a schema, instead of asking nicely in the prompt and cleaning up afterward. Constrained generation masks invalid tokens as the model writes, so the result is guaranteed to be parseable JSON that matches your shape. For the inevitable legacy cases, the [AI JSON Cleaner](/tools/ai-json-cleaner/) repairs raw text.

## Three levels of reliability

**1. Prompt-only (least reliable).** You ask for JSON in plain English. It mostly works, but the model still adds [markdown fences](/learn/clean-chatgpt-json/), prose, or [trailing commas](/learn/fixing-trailing-commas/), and occasionally drifts from the shape you wanted. You're always one weird response away from a parse error.

**2. JSON mode.** The model is told to emit syntactically valid JSON. This eliminates fences and chatter, so the output *parses* — but it doesn't guarantee the *shape*. You can still get unexpected keys, missing fields, or wrong types.

**3. Structured output with a schema (most reliable).** You pass a JSON Schema, and the decoder is constrained to produce only output that conforms to it. Valid syntax *and* the right shape are guaranteed, because invalid tokens are masked during generation rather than rejected after the fact.

## Define the schema once, reuse it

The common pattern is to define the shape as a typed model and export it to JSON Schema for the API call:

```python
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    active: bool

# Pass Person's JSON Schema to the model's structured-output API,
# then validate the response back into Person.
```

```ts
import { z } from "zod";

const Person = z.object({
  name: z.string(),
  age: z.number().int(),
  active: z.boolean(),
});
// Convert to JSON Schema for the request; parse the response with Person.
```

This makes the schema the single source of truth: the model is constrained by it, and your code validates against the same definition. For the schema language itself, see [JSON Schema Basics](/learn/json-schema-basics/).

## Always validate, even with guarantees

Constrained decoding is strong, but treat the response as untrusted input anyway:

- Validate it against your schema before using it — see [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/) and the [JSON Best Practices Checker](/tools/json-best-practices-checker/).
- Handle truncation: a response cut off by the token limit is still incomplete even in JSON mode. See [Repairing Truncated LLM JSON](/learn/repair-truncated-llm-json/).
- Keep payloads lean to stay within context limits — [Counting JSON Tokens for LLMs](/learn/count-json-tokens-llm/).

## Frequently asked questions

**What's the difference between JSON mode and structured output?**
JSON mode guarantees the output is valid JSON syntax. Structured output (schema-constrained) additionally guarantees the JSON matches a specific shape — correct keys and types. Structured output is the stronger guarantee.

**Do I still need to validate if the model guarantees JSON?**
Yes. Validate against your schema anyway to catch truncated responses, edge cases, and to keep a single source of truth. Constrained decoding reduces errors; it doesn't replace validation.

**Why not just clean the JSON with regex?**
Regex extraction is brittle — it breaks on nested braces, strings containing `}`, and truncation. Constrained generation removes the problem at the source; cleaning is a fallback for output you don't control.

**How do I guarantee the response matches my fields?**
Pass a JSON Schema (often generated from a Pydantic or Zod model) to the provider's structured-output API, and validate the response against that same schema in your code.
