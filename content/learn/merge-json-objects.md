---
title: "Merging JSON Objects: Shallow vs Deep"
metaTitle: "Merge JSON Objects: Shallow vs Deep Merge"
metaDescription: "Combining two JSON objects sounds simple until nested keys collide. Learn shallow vs deep merge, which side wins, and how arrays are handled."
level: practical
order: 48
keyTerms: [merge json, deep merge, shallow merge, object spread, json combine]
relatedTools: [json-diff-viewer, json-visual-editor]
relatedLearn: [flatten-nested-json, comparing-json-files]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Merging combines two JSON objects into one. A **shallow** merge copies top-level keys, and on a conflict the **second object wins** — but it *replaces* nested objects wholesale. A **deep** merge recurses into nested objects so their sub-keys combine too. Pick the one that matches your intent; they differ only when values are themselves objects. Compare two documents side by side with the [JSON Diff Viewer](/tools/json-diff-viewer/).

![Merging two JSON objects: on a shared key the value from the second object wins, while unique keys from both are kept.](/learn/merge-json-objects.svg)

## Shallow merge: right-hand side wins

A shallow merge takes the top-level keys of both objects. Where a key exists in both, the second object's value overwrites the first:

```json
A = { "theme": "light", "size": 12 }
B = { "theme": "dark",  "lang": "en" }

merged = { "theme": "dark", "size": 12, "lang": "en" }
```

`theme` became `"dark"` (from B); `size` and `lang` are kept because each is unique. In JavaScript this is `{ ...A, ...B }` or `Object.assign({}, A, B)`.

## Where shallow merge surprises people

Shallow merge **replaces** a nested object rather than blending it:

```json
A = { "config": { "theme": "light", "size": 12 } }
B = { "config": { "theme": "dark" } }

shallow merged = { "config": { "theme": "dark" } }   // size is GONE
```

Because `config` exists in both, B's entire `config` object replaces A's — so `size` disappears. If you expected `size` to survive, you wanted a **deep** merge.

## Deep merge: recurse into nested objects

A deep merge walks into nested objects and merges their keys too:

```json
deep merged = { "config": { "theme": "dark", "size": 12 } }
```

`size` is preserved and `theme` is updated. A minimal recursive implementation:

```js
function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = (v && typeof v === "object" && !Array.isArray(v) &&
              out[k] && typeof out[k] === "object")
      ? deepMerge(out[k], v)
      : v;
  }
  return out;
}
```

The object spread (`{ ...a, ...b }`) is shallow only — it does **not** recurse, which is the single most common merge bug.

## Arrays are the other decision

Neither approach has an obvious rule for arrays. When both objects have an array at the same key, do you **replace**, **concatenate**, or **merge by index/id**? Most deep-merge utilities replace by default; some concatenate. Decide explicitly, because "merge by id" (matching array elements on a key) is often what you actually want but rarely the default.

To see exactly what changed between two versions before or after merging, use the [JSON Diff Viewer](/tools/json-diff-viewer/). For combining many records rather than two configs, see [Comparing JSON Files](/learn/comparing-json-files/).

## Frequently asked questions

**What's the difference between a shallow and deep merge?**
A shallow merge only combines top-level keys and replaces nested objects entirely. A deep merge recurses into nested objects so their sub-keys combine. They differ only when values are objects.

**When two objects share a key, which value wins?**
By convention the second (right-hand) object wins, overwriting the first. Unique keys from both objects are kept.

**Why did keys disappear when I merged with object spread?**
The spread operator (`{...a, ...b}`) is a shallow merge — a nested object in `b` replaces the whole nested object in `a`, dropping keys that were only in `a`. Use a deep merge to preserve them.

**How are arrays merged?**
There's no standard rule. Tools typically replace the array, but some concatenate, and "merge by id" is often what you want. Choose the behavior deliberately for your data.
