---
title: "Sorting JSON Keys Alphabetically"
metaTitle: "Sort JSON Keys for Clean Diffs & Stable Output"
metaDescription: "Sorting object keys makes JSON deterministic — smaller git diffs, fewer merge conflicts, stable hashes. Learn how to sort keys and when not to."
level: practical
order: 49
keyTerms: [sort json keys, deterministic, git diff, canonical json, stable order]
relatedTools: [json-formatter, json-best-practices-checker]
relatedLearn: [pretty-vs-minified, common-patterns]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Sorting an object's keys alphabetically makes JSON **deterministic** — the same data always serializes the same way. That means smaller git diffs, fewer merge conflicts, and stable hashes for caching or signatures. Key order has **no effect on the data's meaning**, so sorting is safe. Sort and reformat in one step with the [JSON Formatter](/tools/json-formatter/).

![Sorting object keys alphabetically produces a deterministic order, which shrinks diffs and avoids merge conflicts.](/learn/sort-json-keys.svg)

## Why order doesn't change meaning — but still matters

JSON objects are **unordered** by definition: `{"a":1,"b":2}` and `{"b":2,"a":1}` represent the same data, and parsers treat them identically. So sorting keys never changes what the JSON *means*.

What it changes is the **text**. And a lot of tooling cares about the text:

- **Git diffs.** If two processes emit the same config in different key orders, every line looks changed. Sorted keys mean a diff shows only the values that actually changed.
- **Merge conflicts.** Deterministic order keeps unrelated edits from colliding.
- **Hashes and signatures.** Caching keys, ETags, and signed payloads depend on byte-for-byte stable output. Reorder the keys and the hash changes even though the data didn't.
- **Findability.** In a large config, alphabetized keys are simply faster to scan.

## How to sort

**In the browser:** paste into the [JSON Formatter](/tools/json-formatter/) to sort keys and pretty-print (or minify) in one pass.

**In JavaScript**, a recursive sort that handles nested objects:

```js
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((k) => [k, sortKeys(value[k])])
    );
  }
  return value;
}
JSON.stringify(sortKeys(data), null, 2);
```

**In Python**, the encoder has it built in:

```python
import json
json.dumps(data, sort_keys=True, indent=2)
```

Note that sorting recurses into nested objects but **must not reorder arrays** — array order *is* meaningful data, unlike object key order.

## When not to sort

- **When key order is intentional for humans.** A config grouped by concern (server settings together, then logging) can read better than alphabetical. Sorting flattens that intent.
- **Inside arrays.** Never sort array *elements* as a side effect — that changes the data. Only object keys are safe to reorder.

For a canonical, byte-stable form used in signing, sorting keys is one half of "canonical JSON"; the other half is consistent whitespace — see [Pretty vs Minified JSON](/learn/pretty-vs-minified/). To confirm two documents are equivalent regardless of key order, use the [JSON Diff Viewer](/tools/json-diff-viewer/).

## Frequently asked questions

**Does sorting JSON keys change the data?**
No. JSON objects are unordered, so reordering keys doesn't change the data's meaning. It only changes the serialized text, which is what tools like git and hashers see.

**Why sort JSON keys at all?**
To make output deterministic: smaller diffs, fewer merge conflicts, and stable hashes for caching or signing. It also makes large objects easier to scan.

**Does sorting reorder array elements too?**
It should not. Array order is meaningful data. Sort only object keys; recurse into arrays to sort the keys of objects *inside* them, but leave element order alone.

**How do I sort keys in Python or JavaScript?**
In Python, `json.dumps(data, sort_keys=True)`. In JavaScript, sort `Object.keys()` recursively and rebuild the object, or use a tool like the [JSON Formatter](/tools/json-formatter/).
