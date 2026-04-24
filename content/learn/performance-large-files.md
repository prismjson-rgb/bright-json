---
title: "Performance: Large JSON Files"
level: advanced
order: 16
keyTerms: []
publishedAt: "2025-12-11"
---

Parsing a large JSON file is straightforward until it is not. A 5MB file parses instantly. A 500MB file can freeze a browser tab, exhaust a server's memory, or trigger a timeout. Understanding how parsers work — and the alternatives when they break down — is essential for working with production data at scale.

## Why large JSON is slow

Standard JSON parsers (like `JSON.parse()`) load the entire file into memory and build a complete in-memory object tree before returning. For a 200MB file, you need at least 200MB of raw bytes, plus the memory for the object tree (often 3–10x the file size), plus garbage collection overhead. The browser's main thread blocks the entire time.

## What counts as "large"?

- Under 1MB — no concern, parse normally
- 1–10MB — consider streaming if you only need part of the data
- 10–50MB — streaming recommended; loading fully will be slow and may cause issues
- Over 50MB — do not load fully; streaming or pre-processing required

## Streaming parsers: process chunk by chunk

A streaming parser reads the file incrementally. It fires events or yields tokens as it reads, so you process each piece immediately without ever holding the full document in memory.

Node.js with `stream-json`:

```javascript
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray.js";
import fs from "fs";

fs.createReadStream("large.json")
  .pipe(parser())
  .pipe(streamArray())
  .on("data", ({ key, value }) => {
    // Process each array element one at a time
    processRecord(value);
  })
  .on("end", () => console.log("Done"));
```

Python with `ijson`:

```python
import ijson

with open("large.json", "rb") as f:
    for record in ijson.items(f, "item"):
        process_record(record)
```

Both examples process an array of objects without loading the full array into memory.

## Browser: use a Web Worker

If you must parse large JSON in a browser, move the parsing off the main thread using a Web Worker. This prevents UI freezes:

```javascript
// worker.js
self.onmessage = (e) => {
  const data = JSON.parse(e.data);
  self.postMessage(data);
};

// main.js
const worker = new Worker("worker.js");
worker.postMessage(largeJsonString);
worker.onmessage = (e) => {
  // data is ready, UI was never blocked
  renderData(e.data);
};
```

## Pagination and chunked API responses

The best approach for large datasets is often to not have large JSON at all. Design APIs to return paginated responses:

```json
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "meta": {
    "page": 2,
    "perPage": 100,
    "total": 5000,
    "nextCursor": "eyJpZCI6MTAwfQ=="
  }
}
```

Cursor-based pagination (using a cursor token instead of page numbers) is more efficient for large datasets where items are frequently inserted or deleted.

## Binary formats for very large data

For data volumes where even streaming JSON is too slow, consider:

- **MessagePack** — binary JSON equivalent, typically 20–50% smaller, 2–5x faster to parse
- **BSON** — binary JSON used by MongoDB, supports more types
- **Parquet** — columnar format ideal for analytics on millions of records
- **Arrow** — in-memory columnar format with near-zero deserialization cost

## Reduce file size before parsing

Before paying the cost of parsing a huge JSON file, reduce it:

- Minify first — remove whitespace (saves 15–30%)
- Remove unused fields — if you only need 3 of 50 keys, strip the rest before parsing
- Compress — gzip typically reduces JSON by 70–90%; always use it for API transfers

## Try it in JSON Prism

The [JSON Token Estimator](/tools/json-token-estimator/) counts tokens in your JSON payload — useful for understanding costs when sending JSON to LLM APIs with token limits. To strip unused fields and reduce file size before processing, use the [JSON Trimmer](/tools/json-trimmer/).
