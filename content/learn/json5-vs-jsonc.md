---
title: "JSON5 vs JSONC: Comments in JSON"
metaTitle: "JSON5 vs JSONC: Which to Use for Config"
metaDescription: "Plain JSON forbids comments and trailing commas. JSONC and JSON5 relax the rules differently. Learn what each allows and which to pick for config files."
level: intermediate
order: 39
keyTerms: [json5, jsonc, json comments, trailing commas, config files]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Plain JSON has no comments and no trailing commas. **JSONC** is "JSON with Comments" — it adds `//` and `/* */` comments (and tolerates trailing commas), popularized by VS Code. **JSON5** is a larger superset that also allows unquoted keys, single quotes, and more relaxed numbers. Use **JSONC** for config in tools that already accept it; use **JSON5** when you want fully human-friendly config and control the parser. Strip either back to strict JSON with the [JSON Trimmer](/tools/json-trimmer/).

## Why plain JSON has neither

JSON ([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)) is a data-interchange format with a deliberately minimal grammar — no [comments](/learn/syntax-rules/), no [trailing commas](/learn/fixing-trailing-commas/), [double quotes only](/learn/fix-single-quotes-json/), [quoted keys](/learn/fix-unquoted-keys-json/). That strictness is a feature for machine-to-machine data, but a pain for hand-edited config files where you'd like to leave a note or reorder lines cleanly. JSONC and JSON5 exist to fill that gap.

## What each one allows

| Feature | JSON | JSONC | JSON5 |
| --- | --- | --- | --- |
| `//` and `/* */` comments | ❌ | ✅ | ✅ |
| Trailing commas | ❌ | ✅ (tolerated) | ✅ |
| Unquoted keys | ❌ | ❌ | ✅ |
| Single-quoted strings | ❌ | ❌ | ✅ |
| Hex / leading-dot numbers, `+`, `Infinity` | ❌ | ❌ | ✅ |
| File extension | `.json` | `.jsonc` | `.json5` |

JSONC is "JSON plus comments" and little else. JSON5 is a genuinely different, more permissive syntax.

## JSONC: the pragmatic choice

JSONC shines where the tooling already understands it:

```text
{
  // TypeScript compiler options
  "compilerOptions": {
    "strict": true,
    "target": "ES2022", // newest supported
  }
}
```

VS Code settings, `tsconfig.json`, and many editor configs accept JSONC. It's the low-friction option: you get comments without a new dependency or a different mental model, and you can drop back to strict JSON by removing the comments.

## JSON5: maximum readability

JSON5 goes further for human-authored files:

```text
{
  unquoted: 'and single quotes',
  trailingComma: true,
  hex: 0xdecaf,
  // and comments
}
```

Choose JSON5 when configs are complex enough that readability really matters and you're willing to add the `json5` parser to your toolchain. The cost is that JSON5 is *not* JSON — `JSON.parse()` will reject it, so every consumer needs the JSON5 library.

## The catch: neither parses with `JSON.parse()`

Both formats are for *authoring*. The moment data needs to be interchanged, convert to strict JSON:

- Paste a JSONC/JSON5 file into the [JSON Trimmer](/tools/json-trimmer/) to strip comments, trailing commas, and other extras into spec-compliant JSON.
- Validate the result with the [JSON Validator](/tools/json-validator/).

If you ever see comments or trailing commas causing `JSON.parse()` to throw, that's the signal you've got JSONC/JSON5 where strict JSON was expected. For more format trade-offs, see [JSON vs YAML](/learn/json-vs-yaml/) and [JSON Alternatives](/learn/json-alternatives/).

## Frequently asked questions

**Can JSON have comments?**
Not standard JSON. JSONC and JSON5 add comments, but `JSON.parse()` and strict parsers reject them. Strip comments before interchanging the data.

**What's the difference between JSONC and JSON5?**
JSONC is essentially JSON plus comments (and tolerated trailing commas). JSON5 is a broader superset that also allows unquoted keys, single quotes, and relaxed number formats.

**Which should I use for a config file?**
Use JSONC if your tool already supports it (e.g. VS Code, `tsconfig.json`) — it's the least friction. Use JSON5 when you want the full set of human-friendly features and can add its parser.

**How do I convert JSON5 or JSONC to plain JSON?**
Remove the comments and trailing commas and quote any bare keys — or paste it into the [JSON Trimmer](/tools/json-trimmer/), which outputs strict JSON in one step.
