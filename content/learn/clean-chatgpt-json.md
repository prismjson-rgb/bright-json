---
title: "Cleaning JSON from ChatGPT and LLMs"
metaTitle: "Clean ChatGPT JSON (Strip Markdown Fences)"
metaDescription: "ChatGPT often wraps JSON in ```json fences or adds chatter. Learn how to strip the markdown and prose so the output parses cleanly every time."
level: intermediate
order: 34
keyTerms: [chatgpt json, markdown fences, code block, clean json, llm output]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** When ChatGPT returns JSON, it often wraps it in a ```` ```json ```` markdown fence or adds a sentence like *"Sure! Here's the JSON:"* — both of which make `JSON.parse()` fail. The fix is to **extract just the JSON** before parsing. Paste the raw reply into the [AI JSON Cleaner](/tools/ai-json-cleaner/) to strip fences, prose, and trailing commas in one step.

## Why ChatGPT's JSON won't parse

The model is trained to be helpful and to format code nicely, which works against you when you need raw data:

- **Markdown code fences** — the reply starts with ```` ```json ```` and ends with ```` ``` ````. Those backticks are not JSON.
- **Conversational preamble or trailing notes** — "Here's your data:" before, "Let me know if you need changes!" after.
- **Trailing commas**, because models mimic human-written JavaScript.
- **Smart quotes** (`"` `"`) instead of straight `"` when the text passes through a chat UI.

Any one of these throws `Unexpected token` the moment you call `JSON.parse()`.

## The quick fix: extract the JSON

A pragmatic approach is to pull out everything between the first `{` (or `[`) and the last matching `}` (or `]`):

```js
function extractJson(reply) {
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : reply;
  const start = body.search(/[{[]/);
  const end = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
  return body.slice(start, end + 1);
}

JSON.parse(extractJson(reply));
```

This handles the two most common cases — a fenced block, or JSON buried in prose. For messier output (smart quotes, trailing commas, truncation), the [AI JSON Cleaner](/tools/ai-json-cleaner/) applies a fuller repair pass and shows you the cleaned result.

## The better fix: stop the chatter at the source

Cleaning after the fact is a patch. The durable fix is to make the model emit raw JSON:

- **Ask for it explicitly:** "Respond with only valid JSON. No markdown, no code fences, no commentary."
- **Use the provider's structured-output / JSON mode** so the response is constrained to JSON at generation time. See [Getting Reliable JSON from LLMs](/learn/reliable-json-from-llms/).
- **Validate against a schema** so you catch a malformed or off-shape response immediately — see [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/).

For the broader set of breakages models introduce — and how to repair them — see [Fixing Broken LLM JSON](/learn/fixing-llm-json/).

## Watch the token cost too

If you're piping large JSON into or out of a model, remember that JSON's quotes and braces are token-expensive. Before sending a big payload, estimate it with the [JSON Token Estimator](/tools/json-token-estimator/) — see [Counting JSON Tokens for LLMs](/learn/count-json-tokens-llm/).

## Frequently asked questions

**Why does ChatGPT wrap JSON in ```json?**
It's trained to format code in markdown for readability. The fences look right in a chat window but aren't part of the JSON, so they break `JSON.parse()`.

**How do I remove the code fences from ChatGPT output?**
Extract the text between the fences (or between the first `{`/`[` and the last `}`/`]`), or paste the reply into the [AI JSON Cleaner](/tools/ai-json-cleaner/) which strips them automatically.

**How do I stop ChatGPT from adding explanations?**
Instruct it to return only valid JSON with no markdown or commentary, and use the API's JSON / structured-output mode, which constrains the response to JSON.

**Why are the quotes in the JSON "curly"?**
Chat interfaces sometimes convert straight quotes to typographic ones. Replace `"`/`"` with `"`, or let a cleaner normalize them, before parsing.
