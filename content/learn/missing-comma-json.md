---
title: "Missing Comma in JSON: How to Spot It"
metaTitle: "Fix Missing Comma in JSON (Expected , Errors)"
metaDescription: "A missing comma between two members is a top JSON error. Learn the exact rule for commas, how to read the error, and how to find the gap fast."
level: practical
order: 33
keyTerms: [missing comma, json separator, expected comma, json.parse, json syntax]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** JSON uses a comma to **separate** items inside an object or array — one between each pair, none after the last. A missing comma produces errors like `Expected ',' or '}' after property value in JSON` or `Unexpected string in JSON`. The fix is to add the comma between the two members. To land on the exact spot, paste the document into the [JSON Debugger](/tools/json-debugger/).

## The comma rule, exactly

A comma goes **between** members, never before the first or after the last:

```json
{
  "a": 1,
  "b": 2,
  "c": 3
}
```

Two commas, for three members. The mirror image of this rule is the [trailing comma](/learn/fixing-trailing-commas/) error — a comma where there shouldn't be one. A *missing* comma is the opposite: a boundary with no separator.

## What a missing comma looks like

```json
{
  "name": "Dana"
  "role": "admin"
}
```

After `"Dana"` the parser expects either a comma (another property follows) or `}` (the object ends). Instead it finds `"role"`, so it reports something like `Expected ',' or '}' after property value` — with the position pointing at the start of `"role"`. The same happens in arrays:

```json
[1 2 3]
```

`Expected ',' or ']'` after the `1`. The fix is `[1, 2, 3]`.

## Why it's easy to miss

Missing commas usually come from **hand-editing**:

- You added a new property but forgot the comma on the line above it.
- You reordered lines and the comma ended up in the wrong place.
- You pasted two objects together without a separator.

Because the error points at the *next* token (the thing that appeared where a comma should be), people look at `"role"` and see nothing wrong with it — the real fix is on the line before. Always look at the boundary between the highlighted token and the one above it.

## How to find and fix it

1. Read the position from the error and jump to it with the [JSON Debugger](/tools/json-debugger/).
2. Look at the **end of the previous line** — that's where the comma belongs.
3. Add the comma, then re-check with the [JSON Validator](/tools/json-validator/).

The durable fix is to stop writing JSON by hand. `JSON.stringify()` always inserts commas correctly, so generating JSON from data eliminates the whole class of comma errors — see [Parse and Stringify](/learn/parse-stringify/).

## Frequently asked questions

**Where do commas go in JSON?**
Between members of an object or array — one comma for each gap. There's no comma before the first member or after the last.

**What error does a missing comma cause?**
Usually `Expected ',' or '}'` (objects) or `Expected ',' or ']'` (arrays), or an "unexpected" token error pointing at the member that came right after the missing separator.

**The error points at a line that looks correct — why?**
The reported token is the one that appeared where a comma was expected. The missing comma is on the line *before* it, so check the previous member's end.

**How do I avoid missing commas entirely?**
Generate JSON with `JSON.stringify()` (or `json.dumps()` in Python) instead of typing it. Serializers always place commas correctly.
