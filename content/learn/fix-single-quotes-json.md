---
title: "Single Quotes in JSON: Why They're Invalid"
metaTitle: "Fix Single Quotes in JSON (Use Double Quotes)"
metaDescription: "JSON requires double quotes for every key and string. Learn why single quotes break JSON.parse(), and how to convert them to valid double-quoted JSON."
level: practical
order: 30
keyTerms: [single quotes, double quotes, json string, json.parse, invalid json]
relatedTools: [json-validator, json-debugger]
relatedLearn: [common-mistakes, fix-unquoted-keys-json, syntax-rules]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** JSON allows **double quotes only** — every key and every string value must be wrapped in `"`. Single quotes (`'`) are invalid, even though JavaScript and Python accept them, so `JSON.parse()` rejects them. To fix it, replace the single quotes with double quotes. The [JSON Trimmer](/tools/json-trimmer/) converts single-quoted JSON5-style input into strict JSON automatically.

## What's invalid

This looks like JSON but isn't:

```text
{'name': 'Dana', 'role': 'admin'}
```

The keys and values use `'`. Strict JSON requires:

```json
{"name": "Dana", "role": "admin"}
```

The error you'll see is typically `Unexpected token ' in JSON` (or, in newer engines, a message saying property names must be double-quoted strings), with the position pointing at the first single quote.

## Why JSON only allows double quotes

JSON's grammar was kept deliberately tiny so that every parser in every language agrees on what's valid. Allowing both quote styles would add ambiguity for no benefit, so the spec ([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)) permits exactly one: the double quote. This is the same minimalism that forbids [trailing commas](/learn/fixing-trailing-commas/) and comments.

The confusion comes from neighboring languages:

- **JavaScript** object literals accept `'single'`, `"double"`, and `` `backtick` `` strings.
- **Python** dictionaries print with single quotes by default (`str(my_dict)`), which is *not* JSON.

So code that's perfectly valid in a `.js` file or a Python REPL becomes invalid the moment it's treated as JSON.

## How to fix it

- **Quickly:** paste it into the [JSON Trimmer](/tools/json-trimmer/), which normalizes single quotes (and other JSON5 extras) to strict, double-quoted JSON.
- **In Python:** never build JSON with `str(dict)` or `print(dict)`. Use `json.dumps()`, which always emits double quotes:

```python
import json
data = {"name": "Dana", "role": "admin"}
json.dumps(data)   # '{"name": "Dana", "role": "admin"}'
```

- **In JavaScript:** generate JSON with `JSON.stringify()` rather than writing object literals by hand — it always double-quotes keys and strings. See [Parse and Stringify](/learn/parse-stringify/).

## What about apostrophes inside values?

A double-quoted string can contain an apostrophe with no escaping needed:

```json
{"note": "it's fine"}
```

You only need to escape a `"` that appears *inside* a double-quoted string (as `\"`). For the full rules on quotes and escapes, see [Escaping Special Characters](/learn/escaping-special-chars/). After converting, validate with the [JSON Validator](/tools/json-validator/) to be sure nothing else is off.

## Frequently asked questions

**Can JSON use single quotes?**
No. JSON requires double quotes for all keys and string values. Single quotes always cause a parse error.

**Why does my Python dictionary look like JSON but won't parse?**
Printing a dict (`str(dict)`) uses single quotes and Python literals like `True`/`None`, which aren't valid JSON. Use `json.dumps()` to produce real JSON.

**How do I convert single quotes to double quotes safely?**
Don't do a blind find-and-replace — apostrophes inside values would break. Use a JSON5-aware tool like the [JSON Trimmer](/tools/json-trimmer/), or re-serialize the data with your language's JSON encoder.

**Do I need to escape apostrophes in JSON?**
No. An apostrophe inside a double-quoted string is just a normal character. Only the double quote and backslash need escaping inside a string.
