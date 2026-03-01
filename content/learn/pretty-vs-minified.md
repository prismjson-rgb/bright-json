---
title: Pretty Print vs Minified
level: practical
order: 11
keyTerms: []
---

Pretty-printed JSON uses indentation and newlines for readability—ideal for config files and debugging. Minified JSON removes whitespace to reduce size—ideal for APIs and network transfer. Same data, different formatting.

```text
// Pretty (readable)
{
  "name": "Alice",
  "age": 30
}

// Minified (compact)
{"name":"Alice","age":30}
```
