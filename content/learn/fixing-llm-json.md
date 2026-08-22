---
title: "How to Fix Broken JSON from ChatGPT, Claude & Other LLMs"
metaTitle: "Fix Broken JSON from ChatGPT, Claude & LLMs"
metaDescription: "LLMs often return JSON wrapped in markdown, with trailing commas, comments, or truncation. Learn why it breaks and how to repair it reliably."
level: practical
order: 19
keyTerms: [LLM JSON, ChatGPT JSON, Claude JSON, fix JSON, structured output, json repair]
relatedTools: [ai-json-cleaner, json-validator]
relatedLearn: [clean-chatgpt-json, repair-truncated-llm-json, reliable-json-from-llms]
publishedAt: "2026-06-16"
updatedAt: "2026-06-16"
---

**Quick answer:** Large language models like ChatGPT, Claude, and Gemini frequently return JSON that won't parse because it's wrapped in markdown code fences, prefixed with explanatory prose, or contains trailing commas, comments, single quotes, or is cut off mid-response. To fix it: strip everything outside the outermost `{ }` or `[ ]`, remove trailing commas and comments, and re-validate. The [AI JSON Cleaner](/tools/ai-json-cleaner/) does this in one step.

## Why LLM JSON breaks

Language models generate text token by token — they don't run a JSON serializer. So even when you ask for "JSON only," the output drifts from the spec in predictable ways:

- **Markdown code fences** — the response is wrapped in ` ```json ... ``` `, which is not valid JSON.
- **Conversational preamble** — "Sure! Here's the JSON you requested:" before the actual object, or a summary after it.
- **Trailing commas** — `{"a": 1, "b": 2,}` — valid in JavaScript, invalid in JSON.
- **Comments** — `// like this` or `/* this */`, which the JSON spec forbids.
- **Single quotes** — `{'name': 'Dana'}` instead of double quotes.
- **Unescaped control characters** — raw newlines or tabs inside string values.
- **Truncation** — the model hits its token limit and the JSON simply stops, leaving unbalanced brackets.
- **Smart quotes** — `"` and `"` substituted for `"` after passing through a chat UI.

## The fast fix

For a one-off, paste the raw model output into the [AI JSON Cleaner](/tools/ai-json-cleaner/). It extracts the JSON payload from surrounding prose and code fences, then applies safe repairs for the issues above and hands you strict, valid JSON.

**Before** — a typical ChatGPT response:

````text
Sure! Here's the user object:

```json
{
  // primary user
  'name': 'Dana',
  "roles": ["admin", "editor",],
}
```

Let me know if you need anything else!
````

**After** — extracted and repaired:

```json
{
  "name": "Dana",
  "roles": ["admin", "editor"]
}
```

If the JSON is *truncated* rather than just dirty, the [JSON Debugger](/tools/json-debugger/) points to the exact position where parsing failed so you can see where the response was cut off and either re-prompt or close the open brackets by hand.

For input that is valid JSON5 (comments and trailing commas only), the [JSON Trimmer](/tools/json-trimmer/) strips the non-standard extras and returns spec-compliant JSON.

## How to stop it happening

Repairing is a fallback. The real fix is constraining the model so it returns clean JSON in the first place:

1. **Use structured output / JSON mode.** Most APIs now support a response format that guarantees syntactically valid JSON — `response_format: { type: "json_object" }` or a JSON-schema-constrained mode. This eliminates fences, prose, and trailing commas at the source.
2. **Provide a schema.** Passing a [JSON Schema](/learn/json-schema-basics/) (or a tool/function definition) tells the model the exact shape to produce and reduces hallucinated keys.
3. **Lower the temperature.** For data extraction, a temperature near 0 makes output more deterministic and less likely to wander into prose.
4. **Ask for the object only.** An explicit instruction — "Respond with a single JSON object and no other text" — measurably reduces preamble.
5. **Raise the token limit** for large payloads so the response isn't truncated.

Even with JSON mode, validate before you trust the data: a response can be *syntactically* valid JSON yet still have the wrong keys or types. Pair a parser check with a [schema validation](/learn/json-schema-basics/) step for anything that feeds a downstream system.

**Go deeper:** [Cleaning JSON from ChatGPT](/learn/clean-chatgpt-json/) for markdown fences and chatter, [Repairing Truncated LLM JSON](/learn/repair-truncated-llm-json/) for responses cut off by the token limit, [Getting Reliable JSON from LLMs](/learn/reliable-json-from-llms/) for structured output, and [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/) for shape checks.

## Frequently asked questions

**Why does ChatGPT wrap JSON in ```` ```json ````?**
It's trained on markdown-heavy data where code is fenced. The fence is presentation, not data — strip the opening and closing ` ``` ` lines before parsing.

**Is a trailing comma valid in JSON?**
No. JavaScript and JSON5 allow it, but strict JSON (and `JSON.parse()`) rejects it. Remove the comma before the closing `}` or `]`.

**How do I handle a response that's cut off halfway?**
Truncation means the token limit was hit. Re-request with a higher limit, ask the model to continue, or — for a quick local fix — use the [JSON Debugger](/tools/json-debugger/) to find the break point and close the open structures manually.

**Can I trust LLM JSON without validating it?**
No. Valid syntax doesn't guarantee correct content. Always validate against an expected [schema](/learn/json-schema-basics/) before using model output in production.
