---
title: JSON Diff Viewer
metaTitle: JSON Diff Tool | Compare Two JSON Documents Side by Side
metaDescription: Compare JSON documents with a focused side-by-side diff workflow that highlights additions, removals, and changed values.
summary: Review payload changes faster with a dedicated JSON comparison workflow.
category: Compare
appHref: /app/?tool=json-diff-viewer
badge: Diff
order: 6
keywords: [json diff, compare json, json compare tool]
highlights:
  - Side-by-side comparison
  - Faster change review
  - Better than raw text inspection
useCases:
  - Regression checks
  - API version review
  - Config comparison
faqs:
  - question: "How do I compare two JSON files?"
    answer: "Paste the first JSON into the left panel and the second into the right panel of the JSON Diff Viewer. Differences are highlighted immediately — added keys in green, removed keys in red, changed values shown side by side. The comparison is structural, not line-by-line, so formatting differences are ignored."
  - question: "Does JSON diff care about whitespace and formatting?"
    answer: "No. JSON Prism's diff compares the parsed data structures, not the raw text. A minified JSON and a pretty-printed version of the same data will show zero differences. Only actual data changes — different values, added keys, removed keys — are highlighted."
  - question: "Can I diff JSON arrays where items are in a different order?"
    answer: "By default, array order matters in JSON — [1, 2] and [2, 1] are different. The diff viewer can optionally normalize array order before comparing, which is useful when comparing API responses where item ordering is not guaranteed."
  - question: "What is the difference between a JSON diff and a text diff?"
    answer: 'A text diff (like git diff) compares files line by line. A JSON diff compares data structures — it understands that {"a":1,"b":2} and {"b":2,"a":1} are identical because JSON object key order is not significant. This prevents false positives caused purely by reformatting.'
---
The JSON Diff Viewer compares two JSON documents side by side and highlights every addition, removal, and changed value. Instead of scanning two payloads manually — looking for a field that moved, a value that changed, or a key that disappeared — the diff surfaces every change immediately. This is the tool to use any time you need to confirm that two JSON documents are equivalent, or to understand exactly how they differ.

## How to use the JSON Diff Viewer

1. Paste the first JSON document into the left panel and the second into the right panel.
2. The diff runs automatically and highlights changes: green for additions, red for removals, and yellow (or inline) for value changes.
3. Scroll through the diff output — unchanged sections can be collapsed to focus on what actually changed.
4. If the documents have inconsistent formatting, run both through the [JSON Formatter](/tools/json-formatter/) first to ensure indentation doesn't create false differences.
5. Use the [JSON Validator](/tools/json-validator/) if either panel shows a parse error before the diff can run.

## What it fixes

- Spotting a changed field value when the payload has dozens or hundreds of keys
- Identifying a key that was added or removed between two API versions
- Verifying that a data transform or migration script produced the expected output
- Catching whitespace-only or key-order differences that aren't real content changes
- Reviewing a config change before deployment when the file is long and the actual change is small

## Before and after

**Before** — two API responses that look similar but aren't:

```json
{
  "user": {
    "id": 501,
    "name": "Alex",
    "plan": "free",
    "active": true
  }
}
```

```json
{
  "user": {
    "id": 501,
    "name": "Alex",
    "plan": "pro",
    "active": true,
    "trialEnd": "2026-05-01"
  }
}
```

**Diff result** — two changes are immediately visible: `plan` changed from `"free"` to `"pro"`, and `trialEnd` was added as a new field. Without a diff viewer, these changes require careful line-by-line reading to find.

## When to use it

**Regression testing** — after a refactor or dependency upgrade, compare the API response from the previous version with the new one. Any unexpected field change shows up instantly.

**API version review** — when documenting what changed between v1 and v2 of an endpoint, paste both example responses and let the diff generate the changelog for you.

**Environment comparison** — production and staging configs that are supposed to match often drift. Paste both into the diff viewer to find the discrepancy before it causes an incident.

**Before/after transform validation** — when a script maps or transforms JSON from one format to another, diff the input against the output to confirm only the intended changes occurred. Pair this with [JSON Formatter](/tools/json-formatter/) to normalize both sides before comparing.

For patterns that commonly appear in JSON comparisons, see [Common JSON Patterns](/learn/common-patterns/).
