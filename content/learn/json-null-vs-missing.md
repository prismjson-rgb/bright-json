---
title: "null vs Missing Key vs Empty String in JSON"
metaTitle: "JSON null vs Missing Key vs Empty String"
metaDescription: "An explicit null, an absent key, and an empty string are three different states in JSON. Learn what each means and why your code must tell them apart."
level: intermediate
order: 44
keyTerms: [json null, missing key, empty string, undefined, optional fields]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** In JSON, `"x": null`, an **absent** `x`, and `"x": ""` are **three distinct states** — "known to be empty," "not provided," and "a real blank value." Treating them as the same causes subtle bugs, especially in APIs and partial updates. Decide what each means in your schema and handle them explicitly. Check field presence and types with the [JSON Validator](/tools/json-validator/).

![Three distinct states for a JSON field: an explicit null value, a key that is absent entirely, and a present key holding an empty string.](/learn/json-null-vs-missing.svg)

## The three states

```json
{ "name": null }     // key present, value explicitly empty
{ }                  // key absent — no "name" at all
{ "name": "" }       // key present, value is a real empty string
```

- **`null`** says "this field exists and its value is intentionally nothing." For a date, that's "no date set." For a parent ID, "no parent."
- **Missing** says "no information" — the field wasn't sent. In a partial update (`PATCH`), an absent field usually means "don't change this."
- **Empty string** is an actual value: a name that is the zero-length string, which is different from "no name."

## Why the distinction matters

**Partial updates (PATCH).** This is the classic trap. If a client omits `nickname`, you should leave it unchanged. If the client sends `"nickname": null`, they're asking you to *clear* it. Collapsing missing and null together makes one of those impossible to express.

**Defaults.** `value ?? "default"` (nullish coalescing) treats both `null` and `undefined`/missing as "use the default," but treats `""` as a real value. Picking the wrong operator (`||` vs `??`) changes behavior for empty strings and `0`.

**Validation.** A schema can require a key to be *present* yet allow its value to be `null` — those are separate rules. See [JSON Schema Basics](/learn/json-schema-basics/).

## Handling them in code

In JavaScript, distinguish presence from value:

```js
if (!("name" in obj)) {
  // key missing — leave unchanged / no info
} else if (obj.name === null) {
  // explicit null — clear it
} else if (obj.name === "") {
  // real empty string
}
```

Note that reading a missing key yields `undefined`, but JSON itself has **no `undefined`** — `JSON.stringify({a: undefined})` *drops* the key entirely, turning "undefined" into "missing." So a round-trip through JSON erases the difference between `undefined` and absent. See [Parse and Stringify](/learn/parse-stringify/) and [The Six JSON Data Types](/learn/six-data-types/).

## Design guidance

- **Document what each state means** for every optional field in your API.
- **Prefer omitting** a field over sending `null` when "no value" and "not provided" are the same to you — it's smaller and clearer.
- **Use `null` deliberately** when a client needs to *clear* a value in an update.
- **Be consistent**, and validate with a schema so the contract is enforced — the [JSON Best Practices Checker](/tools/json-best-practices-checker/) can flag inconsistent null/empty usage.

## Frequently asked questions

**Is null the same as a missing key in JSON?**
No. `null` is an explicit value meaning "intentionally empty"; a missing key means the field wasn't provided at all. In APIs, especially partial updates, they should be handled differently.

**Is an empty string the same as null?**
No. `""` is a real, present value (a zero-length string). `null` means there is no value. Use the right one for your domain.

**Does JSON have undefined?**
No. JSON has `null` but not `undefined`. `JSON.stringify` drops keys whose value is `undefined`, so they become missing rather than null after serialization.

**How should an API treat a missing field in a PATCH?**
Conventionally, an absent field means "leave it unchanged," while an explicit `null` means "set it to empty/clear it." Document this so clients know how to express each intent.
