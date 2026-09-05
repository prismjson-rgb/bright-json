---
title: The Six JSON Data Types
level: beginner
order: 3
metaTitle: "The 6 JSON Data Types, Explained With Examples"
metaDescription: "String, number, boolean, null, object, array — JSON's six data types explained clearly, with real examples for each."
keyTerms: [string, number, boolean, null, object, array]
relatedTools: [json-validator, json-tree-view]
relatedLearn: [what-is-json, syntax-rules, json-null-vs-missing]
publishedAt: "2025-12-02"
---

JSON has exactly six data types. Understanding these is the foundation of working with JSON. Every value in every JSON document is one of: string, number, boolean, null, object, or array. There are no dates, no functions, no undefined — if you need those, you represent them as strings or omit them entirely.

## String

A sequence of Unicode characters wrapped in double quotes. Single quotes are not allowed. Use a backslash to escape special characters inside strings.

Common escape sequences:
- `\"` — double quote
- `\\` — backslash
- `\n` — newline
- `\t` — tab
- `\uXXXX` — any Unicode character

```json
"Hello, World!"
```

```json
"She said \"hi\" and left."
```

```json
"Path: C:\\Users\\alice"
```

**Important:** Dates are not a native JSON type. Store them as ISO 8601 strings like `"2024-01-15T09:30:00Z"`.

## Number

An integer or floating-point number. No quotes. Scientific notation is valid. There is no separate integer vs float type in JSON — it is all just "number."

```json
42
```

```json
3.14
```

```json
-100
```

```json
1.5e10
```

**Watch out:** Very large integers (above 2^53) can lose precision when parsed in JavaScript. Use strings for large IDs.

## Boolean

Exactly two values: `true` or `false`. Both must be lowercase — `True` or `TRUE` are not valid JSON.

```json
true
```

```json
false
```

## Null

Represents the intentional absence of a value. Always lowercase `null`. It is distinct from an empty string `""` or the number `0`.

```json
null
```

Use `null` when a property exists but has no meaningful value, such as `"deletedAt": null` for a record that has not been deleted yet.

## Object

An unordered collection of key-value pairs enclosed in curly braces `{}`. Keys must be strings. Values can be any of the six types, including other objects — enabling nested structures.

```json
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "address": {
    "city": "London",
    "zip": "EC1A 1BB"
  }
}
```

Key order is not guaranteed. Do not rely on insertion order when parsing JSON objects across different languages and parsers.

## Array

An ordered list of values enclosed in square brackets `[]`. Array elements can be any type, and you can mix types (though keeping them uniform is a best practice).

```json
["red", "green", "blue"]
```

```json
[1, 2, 3, 4, 5]
```

```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

## A complete example using all six types

```json
{
  "username": "alice123",
  "score": 9850,
  "verified": true,
  "nickname": null,
  "tags": ["admin", "beta"],
  "profile": {
    "city": "London",
    "joined": "2022-03-15"
  }
}
```

## Frequently asked questions

**Does JSON support boolean values?**
Yes. Boolean is one of JSON's six data types, with exactly two valid values: `true` and `false`, always lowercase. The boolean `true` is not the same as the string `"true"` — see [true vs "true"](/learn/json-true-vs-string-true/) for how that distinction causes bugs.

## Try it in JSON Prism

Paste any JSON into the [JSON Validator](/tools/json-validator/) to confirm every value uses a valid type. The validator reports exactly which line contains an unsupported value so you can fix it immediately.
