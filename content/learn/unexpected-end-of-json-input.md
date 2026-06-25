---
title: "Unexpected End of JSON Input"
metaTitle: "Fix: Unexpected End of JSON Input Error"
metaDescription: "\"Unexpected end of JSON input\" means the parser ran out of data. Learn the common causes — empty responses, truncation, unclosed brackets — and how to fix each."
level: practical
order: 28
keyTerms: [unexpected end of json input, empty response, truncated json, json.parse, 204 no content]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** `Unexpected end of JSON input` means `JSON.parse()` reached the end of the string before the value was complete — the data was **empty or cut off**. It's different from "unexpected token": there the parser found a *wrong* character; here it found *no more* characters. The fix is to make sure you're parsing a complete, non-empty body. To confirm where a document stops short, paste it into the [JSON Debugger](/tools/json-debugger/), which shows the last valid position.

## What the error really means

`JSON.parse("")` throws this error, and so does `JSON.parse('{"a":1')` — an object that was opened but never closed. The parser consumed everything you gave it and was still waiting for more (a closing `}`, a closing quote, the rest of a number). Reaching the end of input in that state is the error.

```js
JSON.parse("");          // Unexpected end of JSON input
JSON.parse("{");         // Unexpected end of JSON input
JSON.parse('{"a":1,');   // Unexpected end of JSON input
```

## The common causes

- **Empty response body.** An API returned `204 No Content`, or a `DELETE`/`POST` succeeded with no body, and you still called `.json()` on it.
- **Truncated response.** A network timeout, a proxy buffer limit, or a body-size cap cut the JSON off mid-stream, so the closing brackets never arrived.
- **Unclosed structure in hand-written JSON** — a missing `}`, `]`, or closing `"`.
- **Reading a file that hasn't finished writing,** or a stream you parsed before it completed.

## How to fix it

**Guard against empty bodies** before parsing:

```js
const res = await fetch("/api/save", { method: "POST" });
const text = await res.text();
const data = text ? JSON.parse(text) : null;   // 204/empty → null, not a throw
```

**For truncation,** the JSON itself is incomplete — re-fetch it rather than trying to parse a half-document. Check the response `Content-Length` against what you received, and look for timeouts or proxy limits in the middle of large payloads.

**For hand-written JSON,** the [JSON Debugger](/tools/json-debugger/) jumps to the last position it could parse, which is usually right where a bracket or quote is missing. Then run the result through the [JSON Validator](/tools/json-validator/) to confirm it's complete.

## If the JSON is salvageable but truncated

When an LLM or a logging system cut a document off and you genuinely need to recover the partial data, an automatic repair pass can close the open brackets and strings. See [Repairing Truncated LLM JSON](/learn/repair-truncated-llm-json/) for that workflow, or clean model output with the [AI JSON Cleaner](/tools/ai-json-cleaner/). For a complete document, prevention is better: always serialize with `JSON.stringify()` rather than concatenating strings — see [Parse and Stringify](/learn/parse-stringify/).

## Frequently asked questions

**What causes "Unexpected end of JSON input"?**
The string passed to `JSON.parse()` was empty or incomplete. Common sources are a `204 No Content` response, a truncated network reply, or JSON with a missing closing bracket or quote.

**How is it different from "Unexpected token"?**
"Unexpected token" means the parser found an invalid character somewhere in the middle. "Unexpected end of JSON input" means it ran out of characters before the value finished — nothing was wrong, there just wasn't enough.

**How do I stop empty API responses from throwing?**
Read the body as text first and only parse it if it's non-empty: `text ? JSON.parse(text) : null`. This handles `204` and empty success responses cleanly.

**Can I recover truncated JSON?**
Sometimes. If the cut-off is near the end you can auto-close the open brackets to salvage most of the data, but a re-fetch of the complete response is more reliable when possible.
