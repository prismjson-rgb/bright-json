---
title: "JSON Alternatives: When to Use What"
level: expert
order: 18
keyTerms: []
---

JSON5 adds comments and trailing commas. JSONC is JSON with comments (used by VS Code config). YAML is more readable for config. MessagePack is binary and faster. Choose based on use case.

- JSON5: JSON + comments, trailing commas, unquoted keys
- YAML: Human-friendly config, supports comments
- MessagePack: Binary, smaller, faster parsing
- Protocol Buffers: Strong typing, schema-first, binary
