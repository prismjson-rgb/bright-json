---
title: JSON Schema — Structure Your Data
level: intermediate
order: 12
metaTitle: "JSON Schema Tutorial: Validate and Define JSON Structure"
metaDescription: "JSON Schema defines and validates JSON structure. Learn type checking, required fields, patterns, and validation tools."
keyTerms: []
---

JSON Schema is a vocabulary for annotating and validating JSON documents. It defines allowed types, required properties, formats (email, date), and custom rules. Tools like Ajv (JavaScript) and jsonschema (Python) validate data against schemas.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "number", "minimum": 0},
    "email": {"type": "string", "format": "email"}
  },
  "required": ["name", "email"]
}
```
