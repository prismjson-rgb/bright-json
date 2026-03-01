---
title: JSON vs XML vs CSV
level: beginner
order: 2
keyTerms: []
---

JSON is often compared to XML and CSV. XML uses tags and is verbose; JSON is more compact. CSV is flat and great for spreadsheets but poor for nested data. JSON sits in the middle: readable, hierarchical, and widely supported in every programming language.

```text
// XML (verbose)
<user>
  <name>Alice</name>
  <age>30</age>
</user>

// JSON (compact)
{"name": "Alice", "age": 30}

// CSV (flat only)
name,age
Alice,30
```

- JSON: compact, hierarchical, universal support
- XML: verbose, schema-rich, legacy systems
- CSV: flat, spreadsheet-friendly, no nesting
