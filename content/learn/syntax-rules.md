---
title: JSON Syntax Rules — The Golden Rules
level: beginner
order: 4
metaTitle: "JSON Syntax Rules: Keys, Quotes, Commas, and More"
metaDescription: "Master JSON syntax: double quotes for keys and strings, no trailing commas, no comments. Avoid common JSON mistakes."
keyTerms: []
---

Follow these rules or your JSON will be invalid.

- Keys must be strings in double quotes — not single quotes
- Strings must use double quotes — single quotes are invalid
- No trailing commas after the last item in objects or arrays
- No comments allowed — JSON has no `//` or `/* */` support
- `true`, `false`, and `null` must be lowercase
- Numbers have no quotes: use `42`, not `"42"`
- Commas separate items; no comma after the last item

```text
// ✅ Valid JSON
{"name": "Alice", "age": 30}

// ❌ Invalid: single quotes
{'name': 'Alice'}

// ❌ Invalid: trailing comma
{"name": "Alice",}

// ❌ Invalid: unquoted key
{name: "Alice"}
```
