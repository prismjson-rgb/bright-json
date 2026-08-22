---
title: "Unquoted Keys in JSON: The Fix"
metaTitle: "Fix Unquoted Keys in JSON (Quote Property Names)"
metaDescription: "JSON requires every property name to be a double-quoted string. Learn why unquoted keys break parsing and how to quote them to get valid JSON."
level: practical
order: 31
keyTerms: [unquoted keys, property names, json object, json.parse, invalid json]
relatedTools: [json-validator, json-debugger]
relatedLearn: [fix-single-quotes-json, common-mistakes, syntax-rules]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** In JSON, every property name must be a **double-quoted string** — `{"name": "Dana"}`, never `{name: "Dana"}`. Unquoted keys are valid JavaScript but invalid JSON, so `JSON.parse()` throws. The fix is to wrap every key in double quotes. The [JSON Trimmer](/tools/json-trimmer/) adds the missing quotes and returns strict JSON.

## What's invalid

JavaScript object literals let you drop the quotes on keys that are valid identifiers:

```text
{ name: "Dana", role: "admin", age: 30 }
```

That's fine in a `.js` file but not in JSON. The error is usually `Expected property name or '}' in JSON` (or `Unexpected token n in JSON`), pointing at the first unquoted key. Strict JSON needs:

```json
{ "name": "Dana", "role": "admin", "age": 30 }
```

## Why JSON requires quoted keys

JSON treats keys as plain strings, full stop. JavaScript identifiers have rules (no spaces, can't start with a digit, reserved words, etc.), and JSON deliberately avoids importing any of that complexity. Requiring quotes means a key can be *any* string — `"first name"`, `"123"`, `"@type"` — and every parser handles it identically. This is the same design philosophy behind [single double-quotes only](/learn/fix-single-quotes-json/) and no [trailing commas](/learn/fixing-trailing-commas/).

It also means keys that *aren't* legal identifiers are perfectly legal JSON keys:

```json
{ "full name": "Dana Lee", "2fa": true, "x-api-version": "1.0" }
```

None of those could be unquoted in JavaScript, but all are valid quoted JSON keys.

## How to fix it

- **Quickly:** paste the object into the [JSON Trimmer](/tools/json-trimmer/), which quotes bare keys (and strips comments and trailing commas) to produce strict JSON.
- **In code, don't hand-write it.** Serialize from data so quoting is automatic:

```js
const obj = { name: "Dana", role: "admin" };
JSON.stringify(obj);   // {"name":"Dana","role":"admin"}
```

`JSON.stringify()` always double-quotes keys, so generating JSON from objects sidesteps the problem entirely — see [Parse and Stringify](/learn/parse-stringify/).

## Config files are the usual source

Unquoted keys most often sneak in from config files written in relaxed dialects. If you genuinely want bare keys, comments, and trailing commas, use **JSON5** or **JSONC** *on purpose* with a parser that supports them — not `JSON.parse()`. See [JSON5 vs JSONC](/learn/json5-vs-jsonc/) for when each is appropriate. When you need strict JSON, validate the result with the [JSON Validator](/tools/json-validator/).

## Frequently asked questions

**Do JSON keys need quotes?**
Yes. Every property name in JSON must be a double-quoted string. Unquoted keys are invalid and cause a parse error.

**Why is `{name: "x"}` valid in JavaScript but not JSON?**
JavaScript object literals allow unquoted keys that are valid identifiers. JSON is a stricter data format that treats all keys as strings, so it requires quotes around every one.

**How do I add quotes to all my keys at once?**
Use a JSON5-aware cleaner like the [JSON Trimmer](/tools/json-trimmer/), or re-serialize the data with `JSON.stringify()` (JS) or `json.dumps()` (Python), which quote keys automatically.

**Can a JSON key contain spaces or start with a number?**
Yes — as long as it's quoted. `"first name"` and `"2fa"` are valid JSON keys even though they couldn't be unquoted JavaScript identifiers.
