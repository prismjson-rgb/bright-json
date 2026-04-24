---
title: Your First JSON Object
level: beginner
order: 5
tryExample: '{"name": "Your Name", "favoriteColor": "blue", "luckyNumber": 7}'
keyTerms: []
publishedAt: "2025-12-01"
---

A JSON object is a collection of key-value pairs wrapped in curly braces `{}`. Think of it like a dictionary or a filled-in form — each field has a name (the key) and a value. Keys are always strings in double quotes. Values can be any of the [six JSON data types](/learn/six-data-types/).

```json
{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "active": true
}
```

## Anatomy of a JSON object

Every JSON object follows the same structure:

- **Key** — a string in double quotes, e.g. `"name"`
- **Colon** — separates key from value: `:`
- **Value** — any valid JSON value
- **Comma** — separates pairs from each other (no comma after the last pair)

```json
{
  "key": "value",
  "anotherKey": 42
}
```

## What types of values are allowed?

A value in a JSON object can be:

- A **string**: `"hello"`
- A **number**: `42` or `3.14`
- A **boolean**: `true` or `false`
- **Null**: `null`
- Another **object**: `{"city": "Paris"}`
- An **array**: `[1, 2, 3]`

Here is an object that uses all six types at once:

```json
{
  "username": "alice123",
  "score": 9850,
  "verified": true,
  "nickname": null,
  "profile": {
    "city": "London"
  },
  "badges": ["gold", "silver"]
}
```

## How do I write my first JSON object?

Start small. Pick a thing you want to describe — a person, a product, a config setting — and list its properties:

1. Open with `{`
2. Write each property as `"key": value`
3. Separate properties with commas
4. Do not put a comma after the last property
5. Close with `}`

```json
{
  "product": "Widget",
  "price": 9.99,
  "inStock": true,
  "tags": ["sale", "new"]
}
```

## Common beginner mistakes

- Using single quotes: `{'name': 'Alice'}` is invalid — always use double quotes
- Adding a trailing comma: `{"a": 1,}` will cause a parse error
- Forgetting quotes around keys: `{name: "Alice"}` is JavaScript syntax, not JSON

See [JSON Syntax Rules](/learn/syntax-rules/) for the full list of rules.

## Try it in JSON Prism

Paste your JSON object into the [JSON Formatter](/tools/json-formatter/) to check indentation and structure at a glance. Once you have built something more complex, explore [The Six JSON Data Types](/learn/six-data-types/) to understand exactly what values you can use.
