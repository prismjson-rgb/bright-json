---
title: "Repairing Truncated LLM JSON"
metaTitle: "Repair Truncated LLM JSON (Unclosed Brackets)"
metaDescription: "LLMs hit token limits mid-response, leaving JSON with unclosed brackets and strings. Learn how to detect truncation and recover the partial data."
level: intermediate
order: 35
keyTerms: [truncated json, llm output, unclosed brackets, max tokens, repair json]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** When an LLM hits its output-token limit mid-response, the JSON is **cut off** — strings and brackets are left open, and `JSON.parse()` throws `Unexpected end of JSON input`. To recover, either raise the token limit and re-run, or apply a repair pass that closes the dangling structures. The [AI JSON Cleaner](/tools/ai-json-cleaner/) attempts to close open brackets and strings so you can salvage the partial result.

## How to know it was truncated

Truncation has a distinct signature, different from a syntax typo:

- The error is `Unexpected end of JSON input` (ran out of data), not `Unexpected token` (wrong character).
- The text simply *stops* — often mid-string or mid-number, with no closing `}`/`]`.
- If you have access to the API response, the **finish reason** says `length` (or `max_tokens`) rather than `stop`. That's the definitive signal.

```json
{"users": [{"id": 1, "name": "Ada"}, {"id": 2, "name": "Gr
```

The string `"Gr` never closes; two arrays/objects are still open. This is incomplete, not malformed.

## The right fix: prevent the cutoff

Repairing truncated JSON recovers *partial* data — you've still lost whatever came after the cut. So prevention matters:

- **Raise `max_tokens`** (or the model's output cap) to fit the expected response.
- **Reduce what you ask for** — request fewer fields, or paginate large lists into multiple calls.
- **Check the finish reason** in code and re-request when it's `length`:

```js
if (response.choices[0].finish_reason === "length") {
  // response was cut off — retry with a higher limit or smaller request
}
```

- **Use streaming with a running brace counter** if you need to detect truncation as it happens.

## Recovering partial data when you must

Sometimes you can't re-run (cost, latency, the data is "good enough"). To salvage what arrived, close the open structures: finish any open string, then append the missing `]` and `}` in the right order. Doing this by hand is fiddly, so use an automated repair — paste the fragment into the [AI JSON Cleaner](/tools/ai-json-cleaner/), which balances brackets and closes strings, then run the result through the [JSON Validator](/tools/json-validator/) to confirm it parses.

Treat the recovered object as **possibly incomplete**: the last element may be partial, so validate against your expected shape before trusting it — see [Validating LLM JSON Against a Schema](/learn/validate-llm-json-schema/).

## Related LLM JSON issues

Truncation is one of several ways model output breaks. For markdown fences and chatter, see [Cleaning JSON from ChatGPT](/learn/clean-chatgpt-json/); for the general repair toolkit, [Fixing Broken LLM JSON](/learn/fixing-llm-json/); and to keep payloads small enough to avoid limits in the first place, [Counting JSON Tokens for LLMs](/learn/count-json-tokens-llm/).

## Frequently asked questions

**Why does my LLM JSON stop in the middle?**
The model reached its output-token limit before finishing. The response is truncated, leaving strings and brackets unclosed.

**How do I know if JSON was truncated or just malformed?**
Truncation throws `Unexpected end of JSON input` and the API's finish reason is `length`. A malformed-but-complete document throws `Unexpected token` at a specific position.

**Can I recover truncated JSON?**
You can recover the part that arrived by closing the open brackets and strings, but anything after the cutoff is gone. Raising the token limit and re-running is more reliable when possible.

**How do I prevent truncation?**
Increase `max_tokens`, ask for less data per call (paginate large lists), and check the finish reason so you can retry when a response is cut off.
