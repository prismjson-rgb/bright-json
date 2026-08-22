---
title: JSONPath — Query JSON Like SQL
level: advanced
order: 15
metaTitle: "JSONPath Tutorial: Query and Extract JSON Data"
metaDescription: "JSONPath lets you query JSON like XPath for XML. Select nested values with $, ., .., and []. RFC 9535 standard."
keyTerms: []
relatedTools: [json-tree-view, json-visual-editor]
relatedLearn: [query-json-with-jq, objects-arrays-depth]
publishedAt: "2025-12-10"
---

JSONPath is a query language for extracting values from JSON documents, much like XPath does for XML or CSS selectors do for HTML. It is standardized as RFC 9535 (2024). Use it to pull specific values from deeply nested structures without writing custom traversal code.

## Basic syntax

| Syntax | Meaning |
|--------|---------|
| `$` | Root of the document |
| `.key` | Child property named `key` |
| `..key` | Recursive descent — find `key` anywhere in the tree |
| `[n]` | Array element at index `n` (zero-based) |
| `[*]` | All elements of an array |
| `[start:end]` | Array slice |
| `[?(@.field > value)]` | Filter expression |

## Working example

```json
{
  "store": {
    "books": [
      {"title": "Clean Code", "author": "Martin", "price": 35.99, "inStock": true},
      {"title": "Refactoring", "author": "Fowler", "price": 45.00, "inStock": false},
      {"title": "The Pragmatic Programmer", "author": "Hunt", "price": 29.99, "inStock": true}
    ],
    "location": "London"
  }
}
```

Queries against this document:

- `$.store.location` → `"London"`
- `$.store.books[0].title` → `"Clean Code"`
- `$.store.books[*].title` → `["Clean Code", "Refactoring", "The Pragmatic Programmer"]`
- `$.store.books[?(@.inStock == true)].title` → `["Clean Code", "The Pragmatic Programmer"]`
- `$.store.books[?(@.price < 40)].title` → `["Clean Code", "The Pragmatic Programmer"]`
- `$..author` → `["Martin", "Fowler", "Hunt"]` (recursive descent)
- `$.store.books[-1].title` → `"The Pragmatic Programmer"` (last element)

## Filter expressions

Filter expressions use `?()` with `@` representing the current node:

- `?(@.active == true)` — boolean equality
- `?(@.price > 30)` — numeric comparison
- `?(@.name != "Bob")` — inequality
- `?(@.tags)` — existence check (node has the key)

```json
{
  "users": [
    {"name": "Alice", "score": 95, "active": true},
    {"name": "Bob", "score": 72, "active": false},
    {"name": "Carol", "score": 88, "active": true}
  ]
}
```

Query: `$.users[?(@.active == true && @.score > 80)].name` → `["Alice", "Carol"]`

## Using JSONPath in code

JavaScript (using `jsonpath-plus` or `@goessner/jsonpath`):

```javascript
import { JSONPath } from "jsonpath-plus";

const result = JSONPath({ path: "$.store.books[*].title", json: data });
// ["Clean Code", "Refactoring", "The Pragmatic Programmer"]
```

Python (using `jsonpath-ng`):

```python
from jsonpath_ng import parse

expr = parse("$.store.books[*].title")
matches = [m.value for m in expr.find(data)]
```

## JSONPath vs. other approaches

- **vs. hand-written traversal** — JSONPath is declarative and much shorter for complex paths
- **vs. jq** — jq is more powerful but requires a separate tool; JSONPath runs inside your app
- **vs. XPath** — same concept, but for JSON instead of XML

## Try it in JSON Prism

The [JSON Tree View](/tools/json-tree-view/) lets you click into any node to see its path, making it easy to discover the JSONPath expression for any value without writing queries by hand.
