---
title: Pretty Print vs Minified
metaDescription: "Learn the difference between pretty-printed and minified JSON, when to use each format, and how formatting affects file size."
level: practical
order: 11
keyTerms: []
relatedTools: [json-formatter, json-trimmer]
relatedLearn: [minify-json, parse-stringify]
publishedAt: "2025-12-03"
---

Pretty-printed JSON uses indentation and newlines for human readability. Minified JSON removes all unnecessary whitespace to reduce file size. The data is identical — only the formatting differs. Knowing when to use each form is a practical skill for any developer working with APIs or config files.

## What is pretty-printed JSON?

Pretty-printed JSON (also called "formatted" or "beautified" JSON) adds indentation and line breaks to make the structure visually clear:

```json
{
  "user": {
    "name": "Alice",
    "age": 30,
    "roles": [
      "admin",
      "editor"
    ]
  }
}
```

Use pretty-printed JSON for:
- Configuration files checked into version control
- API responses during development and debugging
- Log files where humans need to read the output
- Documentation and README examples

## What is minified JSON?

Minified JSON strips every whitespace character that is not inside a string value:

```json
{"user":{"name":"Alice","age":30,"roles":["admin","editor"]}}
```

Use minified JSON for:
- HTTP API responses in production (smaller payload = faster transfer)
- Storing JSON in databases where each byte counts
- Embedding JSON in JavaScript bundles
- Any context where machines read it but humans do not

## How much size difference does minification make?

For small documents the difference is trivial. For large API responses or files with many short keys, minification typically saves 15–30% of bytes. With gzip compression applied on top, the gap narrows further — but minifying before compressing still helps.

## Does formatting change the data?

No. Whitespace outside string values is not meaningful in JSON. The two forms below are identical to every JSON parser:

```json
{
  "x": 1,
  "y": 2
}
```

```json
{"x":1,"y":2}
```

The only exception: whitespace inside a string value is part of the data and is preserved exactly.

## How do I convert between the two?

In JavaScript:

```json
{"name": "Alice", "score": 42}
```

```javascript
// Minify: parse then re-stringify without indent
const minified = JSON.stringify(JSON.parse(jsonString));

// Pretty-print: parse then re-stringify with indent
const pretty = JSON.stringify(JSON.parse(jsonString), null, 2);
```

Or use a tool — no code required.

## Try it in JSON Prism

The [JSON Formatter](/tools/json-formatter/) converts between pretty and minified with one click. To strip comments, extra whitespace, or redundant keys before minifying, run it through the [JSON Trimmer](/tools/json-trimmer/) first.
