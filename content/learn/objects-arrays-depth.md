---
title: Objects and Arrays in Depth
metaDescription: "Understand JSON objects, arrays, nesting, ordered lists, key-value pairs, and practical patterns for structured data."
level: comfortable
order: 6
keyTerms: []
publishedAt: "2025-12-02"
---

Objects group related data under named keys. Arrays hold ordered lists. The real power of JSON comes from combining them — objects inside arrays, arrays inside objects, objects inside objects. There is no hard limit to nesting depth, but readability and performance degrade after 3–4 levels.

## Objects: named properties

An object is a set of key-value pairs. Use objects when your data has named fields:

```json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "active": true
}
```

Keys must be unique strings. If the same key appears twice, behavior is parser-dependent — most parsers keep the last occurrence, but never rely on this.

## Arrays: ordered lists

An array is a sequence of values. Use arrays when order matters or when you have multiple items of the same shape:

```json
["red", "green", "blue"]
```

```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"},
  {"id": 3, "name": "Carol"}
]
```

## Nesting objects inside arrays

This is the most common real-world JSON pattern — an array of objects. Every REST API list endpoint returns this shape:

```json
{
  "users": [
    {"id": 1, "name": "Alice", "roles": ["admin", "editor"]},
    {"id": 2, "name": "Bob", "roles": ["viewer"]}
  ],
  "metadata": {
    "total": 2,
    "page": 1
  }
}
```

Here `users` is an array of user objects. Each user object contains a `roles` array of strings. And `metadata` is a sibling object.

## Nesting objects inside objects

Object nesting groups logically related fields without mixing them into one flat namespace:

```json
{
  "order": {
    "id": "ORD-001",
    "customer": {
      "name": "Alice",
      "address": {
        "street": "123 Main St",
        "city": "London"
      }
    },
    "items": [
      {"sku": "WIDGET-A", "qty": 2, "price": 9.99},
      {"sku": "GADGET-B", "qty": 1, "price": 49.00}
    ],
    "total": 68.98
  }
}
```

## How deep should you nest?

Beyond 3–4 levels, JSON becomes hard to read and hard to query with tools like JSONPath. Common guidelines:

- Prefer flat structures when possible — avoid nesting just for nesting's sake
- Extract repeated sub-structures into a top-level array and reference by ID
- Split very large documents into multiple smaller ones

## Accessing nested values in code

In JavaScript, chain dot notation or bracket notation:

```json
{
  "company": {
    "departments": [
      {"name": "Engineering", "headcount": 45},
      {"name": "Design", "headcount": 12}
    ]
  }
}
```

```javascript
const data = JSON.parse(jsonString);
const firstDept = data.company.departments[0].name; // "Engineering"
```

## Try it in JSON Prism

Complex nested JSON is much easier to explore visually. Open it in the [JSON Tree View](/tools/json-tree-view/) to collapse and expand branches, or use the [JSON Visual Editor](/tools/json-visual-editor/) to modify nested values without touching raw text.
