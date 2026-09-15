---
title: "Getting Reliable JSON from LLMs"
metaTitle: "Get Reliable JSON from LLMs (Structured Output)"
metaDescription: "Stop parsing LLM JSON with regex. Learn what JSON mode and schema-constrained outputs can guarantee, and how to handle refusals or incomplete replies."
level: intermediate
order: 36
keyTerms: [structured output, json mode, llm json, schema, function calling]
relatedTools: [ai-json-cleaner, json-validator]
relatedLearn: [fixing-llm-json, validate-llm-json-schema, repair-truncated-llm-json]
publishedAt: "2026-06-25"
updatedAt: "2026-09-15"
---

**Quick answer:** Use the provider's *schema-constrained structured output* when your application needs a specific JSON shape. JSON mode can help with syntax, but does not enforce a schema. Check whether the request completed, whether the model refused, and whether the returned value matches your schema before using it. For legacy prompt-only replies, the [AI JSON Cleaner](/tools/ai-json-cleaner/) can help repair raw text.

## Three levels of reliability

**1. Prompt-only (least reliable).** You ask for JSON in plain English. It mostly works, but the model still adds [markdown fences](/learn/clean-chatgpt-json/), prose, or [trailing commas](/learn/fixing-trailing-commas/), and occasionally drifts from the shape you wanted. You're always one weird response away from a parse error.

**2. JSON mode.** The model is constrained toward syntactically valid JSON, but this does not guarantee the *shape*. An incomplete response can still fail to parse. You can also get unexpected keys, missing fields, or wrong types.

**3. Structured output with a schema (most reliable).** You pass a supported JSON Schema, and the provider constrains completed, non-refusal responses to that shape. Check the provider's supported schema features: not every JSON Schema keyword may be available. Refusals and output cut off by token limits require separate handling.

These distinctions follow the [OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs). Other providers can differ, so check their current documentation before relying on a particular guarantee.

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

This makes the schema the single source of truth: the provider constrains supported responses with it, and your code validates against the same definition. For the schema language itself, see [JSON Schema Basics](/learn/json-schema-basics/).

## Validate the response before using it

Constrained decoding is strong, but treat the response as untrusted input anyway:

- Validate it against your schema before using it - see [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/) and the [JSON Best Practices Checker](/tools/json-best-practices-checker/).
- Check refusal and completion status before parsing. A response cut off by the token limit can be incomplete even in JSON mode. See [Repairing Truncated LLM JSON](/learn/repair-truncated-llm-json/).
- Keep payloads lean to stay within context limits - [Counting JSON Tokens for LLMs](/learn/count-json-tokens-llm/).

## Frequently asked questions

**What's the difference between JSON mode and structured output?**
JSON mode aims for valid JSON syntax without enforcing your fields. Schema-constrained structured output can enforce a supported shape for completed, non-refusal responses. Check status and validate either kind before using it.

**Do I still need to validate if the model guarantees JSON?**
Yes. Check refusals and incomplete responses, then validate against your schema. Constrained decoding reduces errors; it does not replace response checks.

**Why not just clean the JSON with regex?**
Regex extraction is brittle - it breaks on nested braces, strings containing `}`, and truncation. Constrained generation removes the problem at the source; cleaning is a fallback for output you don't control.

**How do I make the response match my fields?**
Pass a schema supported by the provider's structured-output API (often generated from a Pydantic or Zod model), check completion and refusal status, and validate the response against the same schema in your code.
