---
title: "Trailing Commas in JSON: Why They Break Parsing"
metaTitle: "Fix Trailing Commas in JSON (Why They Break)"
metaDescription: "A trailing comma is the most common JSON syntax error. Learn why JSON forbids it, how to spot it, and how to remove trailing commas automatically."
level: practical
order: 23
keyTerms: [trailing comma, json error, remove trailing comma, json syntax, fix json]
relatedTools: [json-validator, json-trimmer]
relatedLearn: [common-mistakes, fix-single-quotes-json, missing-comma-json]
publishedAt: "2026-06-16"
updatedAt: "2026-06-16"
---

**Quick answer:** A trailing comma is a comma after the last item in an object or array — like `{"a": 1, "b": 2,}`. JavaScript allows it, but the JSON specification does not, so `JSON.parse()` throws an error. To fix it, remove the comma before the closing `}` or `]`. The [JSON Trimmer](/tools/json-trimmer/) strips trailing commas (and comments) automatically and returns strict JSON.

## What a trailing comma looks like

The comma in JSON is a *separator* between items, not a *terminator* after each one. These are invalid:

```json
{
  "name": "Dana",
  "role": "admin",
}
```

```json
[
  "read",
  "write",
]
```

Both have a comma sitting before the closing bracket with nothing after it. Remove that last comma and both parse fine:

```json
{
  "name": "Dana",
  "role": "admin"
}
```

## Why JSON forbids it

JSON is a deliberately minimal, strict format. Douglas Crockford kept the grammar small so that every parser, in every language, agrees on what's valid. Allowing optional trailing commas would add ambiguity for zero data benefit, so the spec disallows them entirely.

This trips people up because **JavaScript** (since ES5) *does* allow trailing commas in array and object literals, and so do **JSON5** and **JSONC**. So code that's perfectly legal in a `.js` file becomes invalid the moment it's treated as JSON. The error you'll see from `JSON.parse()` is typically:

```
SyntaxError: Unexpected token } in JSON at position 42
```

The position points at (or just after) the offending comma.

## How to fix it

- **One file, quickly:** paste it into the [JSON Trimmer](/tools/json-trimmer/). It removes trailing commas, comments, and other JSON5-style extras, returning spec-compliant JSON you can copy back.
- **Find the exact spot:** the [JSON Debugger](/tools/json-debugger/) jumps to the failing position so you can see which comma broke parsing — useful in large documents where the error position alone isn't obvious.
- **Validate after:** run the result through the [JSON Validator](/tools/json-validator/) to confirm nothing else is wrong.

## How to avoid it

- **Don't hand-edit JSON like JavaScript.** When you delete the last property of an object, also delete the now-trailing comma on the line above.
- **Use JSON5 or JSONC on purpose,** not by accident. If you genuinely want comments and trailing commas in a config file, use a parser that supports them (and a `.json5`/`.jsonc` extension) rather than relying on `JSON.parse()`.
- **Serialize, don't type.** `JSON.stringify()` never produces trailing commas. Generating JSON from data beats writing it by hand. See [Parse and Stringify](/learn/parse-stringify/).

For the other frequent syntax slip-ups — unquoted keys, single quotes, missing commas — see [Common JSON Mistakes](/learn/common-mistakes/).

## Frequently asked questions

**Are trailing commas allowed in JSON?**
No. Strict JSON and `JSON.parse()` reject a comma after the final element of an object or array. Remove it to make the JSON valid.

**Why does JavaScript allow trailing commas but JSON doesn't?**
JavaScript's grammar permits them as a convenience for diffs and reordering. JSON is a stricter data-interchange format with a minimal grammar, so it omits the feature to keep every parser in agreement.

**How do I remove trailing commas automatically?**
Paste the JSON into the [JSON Trimmer](/tools/json-trimmer/), which strips trailing commas and comments and outputs strict JSON in one step.

**What error does a trailing comma cause?**
Usually a `SyntaxError: Unexpected token` pointing near the closing `}` or `]`. The [JSON Debugger](/tools/json-debugger/) shows the exact position.
