---
title: JSON to CSV Converter
metaTitle: JSON to CSV Converter | Convert JSON to CSV Online, Free
metaDescription: Convert a JSON array of objects into CSV instantly in your browser. Nested objects flatten to dot-notation columns; nothing uploads to a server.
summary: Turn a JSON array of objects into a clean, spreadsheet-ready CSV file.
category: Convert
appHref: /app/?tool=json-to-csv
badge: Transform
order: 7.1
keywords: [json to csv, convert json to csv, json to csv converter, json array to csv]
relatedTools: [json-converter, json-formatter, json-validator]
relatedLearn: [convert-json-to-csv, json-vs-xml-csv]
highlights:
  - Nested objects flatten to dot-notation columns automatically
  - Handles commas, quotes, and newlines inside values correctly
  - Runs entirely in your browser — nothing uploads
useCases:
  - Exporting API responses to a spreadsheet
  - Turning a JSON array of test fixtures into a CSV for QA review
  - Preparing JSON data for a teammate who works in Excel or Sheets
faqs:
  - question: "How do I convert JSON to CSV?"
    answer: "Paste a JSON array of objects into the input panel, then open the Convert panel and select the CSV tab (or use this dedicated JSON to CSV tool, which opens straight into it). Each object becomes one row; the union of every object's keys becomes the column headers, in the order they're first seen."
  - question: "Does JSON to CSV conversion work for a single object, not an array?"
    answer: "No — CSV is a table of rows, so the converter needs a top-level array. Wrap a single object in square brackets, e.g. turn { \"name\": \"Alice\" } into [ { \"name\": \"Alice\" } ], and it converts to a one-row CSV."
  - question: "What happens to nested objects and arrays when converting to CSV?"
    answer: "Nested objects are flattened using dot notation — { \"address\": { \"city\": \"X\" } } becomes a column named address.city. Arrays are kept as their JSON text inside a single cell (e.g. [\"admin\",\"editor\"]), since CSV has no native way to represent a list inside one cell."
  - question: "What if some objects have different keys than others?"
    answer: "The converter collects the full set of keys across every object in the array and uses that as the header row. Rows missing a given key just get an empty cell for that column — no row is dropped and no column is skipped."
  - question: "Are commas and quotes inside my values handled safely?"
    answer: "Yes. Any value containing a comma, a double quote, or a newline is automatically wrapped in double quotes, with internal quotes doubled per the standard CSV escaping rule, so it opens correctly in Excel, Google Sheets, or any RFC 4180-compliant reader."
---
The JSON to CSV Converter turns a JSON array of objects into comma-separated values you can open directly in Excel, Google Sheets, or any spreadsheet tool. Each object in the array becomes one row; every key that appears anywhere in the array becomes a column, so the output stays correct even when objects in the array don't all share the exact same shape.

## How to use the JSON to CSV Converter

1. Paste a JSON array of objects into the input panel — e.g. `[{ "name": "Alice", "age": 30 }, { "name": "Bob", "age": 25 }]`.
2. Open the Convert panel; it opens directly on the CSV tab.
3. Review the generated CSV, then copy it or download it as a `.csv` file.
4. If your JSON is a single object instead of an array, wrap it in `[ ]` first — CSV needs rows, and one object is one row.

## What it handles

- Nested objects, flattened to dot-notation columns (`address.city`, `address.zip`) rather than dropped
- Arrays, kept as JSON text inside one cell (`["admin","editor"]`), since a spreadsheet cell can't hold a list natively
- Objects in the array with different keys — headers are the union of every key seen, with blank cells for whichever rows don't have that key
- Values containing commas, double quotes, or newlines — quoted and escaped per standard CSV rules so nothing shifts into the wrong column
- `null` and missing values, both written as an empty cell

## JSON code example

This payload has a nested object and an array field:

```json
[
  { "id": 1, "name": "Alice", "address": { "city": "Austin" }, "tags": ["admin"] },
  { "id": 2, "name": "Bob", "address": { "city": "Reno" }, "tags": [] }
]
```

converts to:

```
id,name,address.city,tags
1,Alice,Austin,"[""admin""]"
2,Bob,Reno,"[]"
```

## When to use it

- **Handing data to someone who works in spreadsheets.** An analyst or stakeholder who doesn't want raw JSON can open the CSV directly in Excel or Sheets.
- **QA and test fixtures.** Turn a JSON array of test cases into a CSV that's easy to scan, filter, and comment on row by row.
- **Quick reporting from an API response.** Convert a paginated API response into a CSV for a one-off report without writing a script.
- **Data warehouse or BI tool imports.** Many ingestion tools accept CSV more readily than nested JSON.

## Related tools and articles

- [JSON Converter](/tools/json-converter/) — convert the same JSON into YAML, XML, TOON, or an escaped string instead
- [JSON Formatter](/tools/json-formatter/) — validate and pretty-print your JSON before converting it
- [JSON Validator](/tools/json-validator/) — confirm the array is syntactically valid JSON first
- [Converting JSON to CSV](/learn/convert-json-to-csv/) — a deeper walkthrough of the flattening rules and edge cases
- [JSON vs XML vs CSV](/learn/json-vs-xml-csv/) — when CSV is (and isn't) the right format for your data
