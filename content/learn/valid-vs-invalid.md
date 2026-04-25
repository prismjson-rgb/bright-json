---
title: Valid vs Invalid JSON
metaDescription: "Learn what makes JSON valid or invalid, with examples of trailing commas, single quotes, comments, and unsupported values."
level: comfortable
order: 8
keyTerms: []
publishedAt: "2025-12-03"
---

Valid JSON follows a strict specification (RFC 8259). Even one character out of place causes the entire document to fail parsing. Understanding the difference between valid and invalid JSON — and why — saves hours of debugging.

## What makes JSON valid?

A valid JSON document must satisfy all of these:

- The root value is an object `{}`, array `[]`, string, number, boolean, or null
- All object keys are strings in double quotes
- Strings use double quotes — not single quotes, not backticks
- No trailing commas after the last item in an object or array
- `true`, `false`, and `null` are lowercase
- No comments of any kind
- No JavaScript-only values like `undefined`, `NaN`, or `Infinity`

## Valid vs invalid examples

```json
{"a": 1, "b": [2, 3]}
```

That is valid. Now compare these common mistakes:

**Trailing comma** — parse error in every standard parser:

```json
{"name": "Alice", "age": 30,}
```

**Single quotes** — valid JavaScript, invalid JSON:

```json
{'name': 'Alice'}
```

**Unquoted key** — valid JavaScript object literal, invalid JSON:

```json
{name: "Alice"}
```

**`undefined` is not a JSON value** — use `null` or omit the property:

```json
{"result": undefined}
```

**`NaN` and `Infinity` are not valid** — JSON has no representation for these:

```json
{"ratio": NaN, "limit": Infinity}
```

**Comments are not allowed** — even `//` breaks JSON parsers:

```json
{
  "port": 3000
  // default port
}
```

## Why is JSON so strict?

JSON's strictness is intentional. A simpler grammar means parsers in any language can be small, fast, and interoperable. JSON5, JSONC, and YAML relax these rules — but they are not JSON and cannot be parsed by `JSON.parse()`.

## How to tell if JSON is valid

1. Try `JSON.parse(yourString)` in a browser console — it throws a `SyntaxError` with a line number if invalid
2. Paste into an online validator
3. Look at the error message — it usually says "Unexpected token" and points to the problem character

## What is the difference between valid JSON and valid data?

JSON can be syntactically valid but semantically wrong. For example, this is valid JSON:

```json
{
  "age": -999,
  "email": "not-an-email",
  "status": "launched"
}
```

It parses without error, but the values may break your application. That is where JSON Schema validation comes in — see [JSON Schema Basics](/learn/json-schema-basics/).

## Try it in JSON Prism

Paste suspect JSON into the [JSON Validator](/tools/json-validator/) for an instant validity check with precise error locations. For deeper debugging — including identifying where data violates expected shapes — try the [JSON Debugger](/tools/json-debugger/).
