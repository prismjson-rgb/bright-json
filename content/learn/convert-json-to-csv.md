---
title: "How to Convert JSON to CSV"
metaTitle: "How to Convert JSON to CSV (Arrays & Nesting)"
metaDescription: "Convert JSON to CSV the right way: flatten arrays of objects into rows and columns, handle nested fields, and avoid broken spreadsheets."
level: practical
order: 24
keyTerms: [json to csv, convert json, flatten json, csv export, json array to csv]
relatedTools: [json-converter]
relatedLearn: [json-vs-xml-csv, flatten-nested-json]
publishedAt: "2026-06-16"
updatedAt: "2026-06-16"
---

**Quick answer:** CSV is a flat table of rows and columns, so JSON converts cleanly only when it's an **array of objects with consistent keys** — each object becomes a row and each key becomes a column. Paste that JSON into the [JSON Converter](/tools/json-converter/) and switch the output to CSV. Deeply nested objects must be flattened first, because CSV has no concept of nesting.

## What converts cleanly

CSV is two-dimensional: rows and columns, nothing more. The JSON shape that maps onto it directly is an array of flat objects that share the same keys:

```json
[
  { "id": 1, "name": "Dana",  "role": "admin"  },
  { "id": 2, "name": "Ravi",  "role": "editor" },
  { "id": 3, "name": "Mei",   "role": "viewer" }
]
```

That becomes:

```csv
id,name,role
1,Dana,admin
2,Ravi,editor
3,Mei,viewer
```

Each object is a row; the union of keys forms the header. This is the ideal case, and the [JSON Converter](/tools/json-converter/) handles it in one click.

## What needs flattening first

CSV has no way to represent nesting, so a value that is itself an object or array can't sit in a single cell meaningfully:

```json
[
  { "id": 1, "name": "Dana", "address": { "city": "Austin", "zip": "73301" } }
]
```

You have two options:

1. **Flatten the keys** — turn `address.city` and `address.zip` into their own columns:

   ```csv
   id,name,address.city,address.zip
   1,Dana,Austin,73301
   ```

2. **Serialize the nested value** into a single cell as a JSON string — workable but awkward to read in a spreadsheet.

Flattening into dotted columns is almost always the better choice for spreadsheet use. Decide on the structure before converting.

## Step by step

1. **Make sure the top level is an array of objects.** If your data is wrapped (e.g. `{ "users": [ ... ] }`), extract the inner array first — the [Minimal Mode](/tools/json-minimal-mode/) path filter can isolate it.
2. **Format and validate** with the [JSON Formatter](/tools/json-formatter/) so you can confirm the keys are consistent across objects.
3. **Convert** in the [JSON Converter](/tools/json-converter/) and select CSV output.
4. **Check the header row** — missing keys in some objects produce empty cells, which is expected; mismatched keys across objects produce sparse columns.

## Gotchas to watch for

- **Inconsistent keys.** If object 1 has `role` and object 2 doesn't, that column is blank for object 2. Normalize first if you need a dense table.
- **Commas and quotes in values.** Proper CSV escapes these by wrapping the field in quotes — the converter handles it, but hand-rolled exports often don't.
- **Arrays of scalars.** A field like `"roles": ["admin","editor"]` has no clean single-cell form; flatten or join it deliberately.
- **Numbers and leading zeros.** Spreadsheets may reformat values like ZIP codes. That's a spreadsheet behavior, not a conversion bug.

For converting to other formats, the same [JSON Converter](/tools/json-converter/) also outputs YAML and XML. To understand the trade-offs between these formats, see [JSON vs XML vs CSV](/learn/json-vs-xml-csv/).

## Frequently asked questions

**How do I convert JSON to CSV?**
Make the top level an array of objects with consistent keys, then paste it into the [JSON Converter](/tools/json-converter/) and choose CSV. Each object becomes a row and each key a column.

**Can I convert nested JSON to CSV?**
Not directly — CSV is flat. Flatten nested objects into dotted columns (`address.city`) first, since a single CSV cell can't hold a sub-object.

**Why is my CSV missing columns?**
CSV columns come from object keys. If some objects omit a key, that column is empty for those rows. Normalize the objects to share the same keys for a dense table.

**Does the conversion upload my data?**
No. The [JSON Converter](/tools/json-converter/) runs entirely in your browser; nothing is sent to a server.
