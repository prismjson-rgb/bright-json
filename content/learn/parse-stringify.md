---
title: Parsing and Stringifying
level: practical
order: 10
metaTitle: "JSON.parse() and JSON.stringify() — Complete Guide"
metaDescription: "Convert JSON text to objects with JSON.parse. Convert objects to JSON with JSON.stringify. Learn revivers, replacers, and pretty-printing."
keyTerms: []
---

In JavaScript: `JSON.parse()` converts a JSON string into an object. `JSON.stringify()` does the opposite. Other languages have equivalents (`json.loads`/`json.dumps` in Python, `json_decode`/`json_encode` in PHP).

```javascript
// Parse: string → object
const str = '{"name":"Alice","age":30}';
const obj = JSON.parse(str);
console.log(obj.name); // "Alice"

// Stringify: object → string
const json = JSON.stringify(obj);
// Pretty-print with 2-space indent
const pretty = JSON.stringify(obj, null, 2);
```
