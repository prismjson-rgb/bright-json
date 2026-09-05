---
title: JSON Syntax Rules — The Golden Rules
level: beginner
order: 4
metaTitle: "JSON Syntax Rules Explained (With Examples)"
metaDescription: "The exact JSON syntax rules for quoted keys, commas, and comments, explained with valid and invalid examples side by side."
keyTerms: []
relatedTools: [json-validator, json-formatter]
relatedLearn: [common-mistakes, valid-vs-invalid, what-is-json]
publishedAt: "2025-12-04"
---

JSON has a small, precise grammar. Break any of these rules and every parser will reject the document. The rules are simple enough to memorize in five minutes.

## The seven golden rules

1. **Keys must be double-quoted strings** — `"name"`, not `name` or `'name'`
2. **Strings must use double quotes** — single quotes are never valid
3. **No trailing commas** — no comma after the last item in an object or array
4. **No comments** — JSON has no `//` or `/* */` syntax
5. **`true`, `false`, and `null` are lowercase** — `True`, `False`, `Null` are all invalid
6. **Numbers have no quotes** — write `42`, not `"42"` (unless you want a string)
7. **The root must be a valid JSON value** — object, array, string, number, boolean, or null

## Valid examples

A valid object:

```json
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "score": null
}
```

A valid array:

```json
["apple", "banana", "cherry"]
```

A valid nested structure:

```json
{
  "user": {
    "id": 1,
    "roles": ["admin", "editor"]
  }
}
```

## Invalid examples and why they fail

Single quotes — invalid:

```json
{'name': 'Alice'}
```

Trailing comma — invalid:

```json
{"name": "Alice", "age": 30,}
```

Unquoted key — invalid:

```json
{name: "Alice"}
```

Comment — invalid:

```json
{
  "port": 3000
  // This is the default port
}
```

Uppercase boolean — invalid:

```json
{"active": True}
```

## Why no comments in JSON?

Douglas Crockford intentionally removed comments from JSON because he observed that developers were using them to hold parsing directives — turning JSON into a configuration language with side effects. JSON is a pure data format. If you need comments, consider JSONC (used by VS Code) or YAML, or store comments as a `_comment` string field.

## What about JSON5?

JSON5 relaxes several of these rules — it allows comments, trailing commas, single quotes, and unquoted keys. But JSON5 is not JSON. Standard parsers like `JSON.parse()` will reject JSON5 syntax. Use JSON5 only if your toolchain explicitly supports it.

## Try it in JSON Prism

Run your JSON through the [JSON Validator](/tools/json-validator/) to catch any rule violations instantly. For a reference on which specific mistakes are most common and how to fix them, see [Common JSON Mistakes](/learn/common-mistakes/).
