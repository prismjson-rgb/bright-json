---
title: JSON Security Best Practices
level: expert
order: 17
metaTitle: "JSON Security: Injection, Deserialization, and Validation"
metaDescription: "Secure your JSON handling: prevent injection, validate with schema, limit depth, sanitize output. Enterprise security guide."
keyTerms: []
---

Untrusted JSON can be dangerous. Validate with a schema, limit parsing depth, and never `eval()` JSON (use `JSON.parse`). Be wary of ReDoS in schema patterns. Whitelist allowed fields in APIs.

- Always use `JSON.parse()`, never `eval()`
- Validate with JSON Schema before trusting data
- Limit object depth to prevent stack overflow
- Sanitize output to prevent XSS when rendering
- Use parameterized queries—never concatenate JSON into SQL
