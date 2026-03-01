---
title: JSONPath — Query JSON Like SQL
level: advanced
order: 15
metaTitle: "JSONPath Tutorial: Query and Extract JSON Data"
metaDescription: "JSONPath lets you query JSON like XPath for XML. Select nested values with $, ., .., and []. RFC 9535 standard."
keyTerms: []
---

JSONPath is a query language for JSON. Use it to extract specific values from nested structures. `$` is the root, `.` accesses children, `..` does recursive descent, `[]` selects by index or condition.

```text
// Data
{"users": [{"name": "Alice", "score": 95}, {"name": "Bob", "score": 87}]}

// JSONPath examples
$.users[0].name     → "Alice"
$.users[*].name     → ["Alice", "Bob"]
$.users[?(@.score > 90)].name → ["Alice"]
```
