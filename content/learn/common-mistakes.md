---
title: Common JSON Mistakes and Fixes
level: intermediate
order: 14
metaTitle: "Top JSON Mistakes: Trailing Commas, Quotes, and How to Fix"
metaDescription: "Avoid the most common JSON errors: trailing commas, single quotes, unquoted keys, and JavaScript-only values. Quick fixes and validation tips."
keyTerms: []
publishedAt: "2025-12-05"
---

Most JSON errors come from developers who know JavaScript well but mix up its object literal syntax with JSON's stricter rules. The fixes are always simple — once you know what to look for.

## Mistake 1: Trailing comma

The most common JSON error. A comma after the last item in an object or array is valid in JavaScript and Python, but not in JSON.

Invalid:

```json
{
  "name": "Alice",
  "age": 30,
}
```

Fixed:

```json
{
  "name": "Alice",
  "age": 30
}
```

The same rule applies inside arrays: `[1, 2, 3,]` is invalid — remove the last comma.

## Mistake 2: Single quotes

JSON requires double quotes for both keys and string values. Single quotes are valid in JavaScript object literals but not in JSON.

Invalid:

```json
{'name': 'Alice', 'city': 'London'}
```

Fixed:

```json
{"name": "Alice", "city": "London"}
```

Deep dive: [Single Quotes in JSON](/learn/fix-single-quotes-json/).

## Mistake 3: Unquoted keys

JavaScript allows `{name: "Alice"}` but JSON does not. Every key must be a quoted string.

Invalid:

```json
{name: "Alice", age: 30}
```

Fixed:

```json
{"name": "Alice", "age": 30}
```

Deep dive: [Unquoted Keys in JSON](/learn/fix-unquoted-keys-json/).

## Mistake 4: undefined or NaN values

`undefined`, `NaN`, and `Infinity` exist in JavaScript but are not valid JSON values. Serializing them with `JSON.stringify()` silently drops them or converts them to `null`.

Invalid:

```json
{"result": undefined, "ratio": NaN}
```

Fixed (use null or omit the field):

```json
{"result": null}
```

## Mistake 5: Comments

JSON has no comment syntax. Not `//`, not `/* */`, not `#`. This is one of the most frequent frustrations for developers coming from YAML or JavaScript.

Invalid:

```json
{
  "port": 3000,
  // Default port for development
  "host": "localhost"
}
```

Fixed — remove the comment:

```json
{
  "port": 3000,
  "host": "localhost"
}
```

If you need comments, consider JSONC (supported by VS Code) or store metadata in a dedicated `_comment` key.

## Mistake 6: Number stored as string (or vice versa)

Wrapping a number in quotes makes it a string. This matters when your code does arithmetic or strict comparisons.

```json
{"count": "42"}
```

This is valid JSON but `count` is a string. If your API expects a number, it will likely fail. Use the correct type:

```json
{"count": 42}
```

Deep dive: [true vs "true": Booleans and Strings in JSON](/learn/json-true-vs-string-true/).

## Mistake 7: Duplicate keys

JSON parsers handle duplicate keys inconsistently — some keep the first, some keep the last. Never use duplicate keys.

```json
{
  "status": "active",
  "status": "inactive"
}
```

Deep dive: [Duplicate Keys in JSON](/learn/json-duplicate-keys/) — why this is valid but dangerous.

## How to find mistakes fast

- Paste into a validator — it points to the exact line and character
- Check the error message: "Unexpected token ," usually means trailing comma; "Unexpected token '" means single quotes
- Decode a specific error: [Unexpected token < at position 0](/learn/unexpected-token-in-json/), [Unexpected end of JSON input](/learn/unexpected-end-of-json-input/), [missing comma](/learn/missing-comma-json/), or [what the position number means](/learn/json-parse-error-position/)

## Try it in JSON Prism

The [JSON Debugger](/tools/json-debugger/) goes beyond syntax checking — it shows you exactly what went wrong and suggests fixes. For pure syntax validation with line-precise error reporting, use the [JSON Validator](/tools/json-validator/).
