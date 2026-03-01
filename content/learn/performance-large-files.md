---
title: "Performance: Large JSON Files"
level: advanced
order: 16
keyTerms: []
---

Parsing huge JSON files can freeze the browser or exhaust memory. Use streaming parsers (e.g., JSONStream in Node, ijson in Python) to process incrementally. For files over 10–50MB, consider splitting or using a binary format.

- Streaming parsers process chunk-by-chunk
- Avoid loading entire file into memory
- Consider pagination or chunked API responses
- Binary alternatives: MessagePack, BSON for very large data
