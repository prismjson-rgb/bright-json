---
title: "Big Numbers in JSON: Avoiding Precision Loss"
metaTitle: "JSON Big Numbers: Fix int64 Precision Loss"
metaDescription: "Large integers like 64-bit IDs silently lose precision when JSON is parsed in JavaScript. Learn why, and how to send big numbers safely as strings or BigInt."
level: advanced
order: 43
keyTerms: [big numbers, int64, precision, bigint, safe integer]
relatedTools: [json-validator, json-debugger]
relatedLearn: [json-dates, json-null-vs-missing]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** JavaScript numbers are IEEE-754 doubles, exact only up to **2⁵³ − 1** (`9007199254740991`). A larger integer in JSON — a 64-bit ID, a Snowflake, a `bigint` primary key — **silently loses precision** when parsed, changing its value. The fix is to send big integers as **strings** (or use a BigInt-aware parser). Inspect suspect payloads in the [JSON Debugger](/tools/json-debugger/).

![JavaScript numbers are safe only up to 2 to the 53rd minus 1; larger integers in JSON lose precision when parsed, so send them as strings.](/learn/json-big-numbers.svg)

## Why the value changes

JSON's number type is just "a number" — the spec doesn't fix a precision. But JavaScript represents every number as a 64-bit float, which can only hold integers exactly up to `Number.MAX_SAFE_INTEGER` (2⁵³ − 1). Beyond that, parsing rounds to the nearest representable double:

```js
JSON.parse('{"id": 12345678901234567}').id;
// → 12345678901234568   (last digit changed!)
```

Nothing throws. The data is just quietly wrong — the worst kind of bug, because it surfaces far from its cause.

## Where this bites

Real-world IDs routinely exceed 2⁵³:

- **Twitter/X Snowflake** and **Discord** IDs (64-bit).
- **PostgreSQL `bigint`** primary keys.
- **Stripe-style** or UUID-derived integer identifiers.
- Financial values stored in the smallest unit (cents/satoshis) for very large amounts.

If any of these flow through JavaScript as JSON numbers, comparisons and lookups can fail because the ID no longer matches.

## The fix: strings or BigInt

**Send big integers as strings** in the JSON. This is the most portable solution — every language reads a string losslessly:

```json
{ "id": "12345678901234567", "balanceCents": "99999999999999999" }
```

Your code converts to `BigInt` only when it needs arithmetic. **BigInt** (ES2020) gives JavaScript arbitrary-precision integers:

```js
const id = BigInt("12345678901234567");   // exact
```

If you can't change the payload to strings, use a **BigInt-aware JSON parser** (e.g. a `json-bigint` library) that parses large integers into `BigInt` instead of `number`. Note that `JSON.stringify` doesn't serialize `BigInt` by default — convert it back to a string when sending.

## Floats lose precision too

The same IEEE-754 limit affects decimals: `0.1 + 0.2 !== 0.3`. For money, don't store dollars as floats — store integer cents (as strings if large), or use a decimal library. For the broader rules on JSON's scalar types, see [The Six JSON Data Types](/learn/six-data-types/), and on serialization behavior, [Parse and Stringify](/learn/parse-stringify/).

## Frequently asked questions

**Why does my big number change when I parse JSON?**
JavaScript stores numbers as 64-bit floats, exact only up to 2⁵³ − 1. Larger integers are rounded to the nearest representable value during `JSON.parse()`, so the value changes silently.

**What's the safe integer limit in JavaScript?**
`Number.MAX_SAFE_INTEGER`, which is 2⁵³ − 1 = 9007199254740991. Integers above this can't all be represented exactly as doubles.

**How do I send a 64-bit ID in JSON safely?**
Send it as a string (`"id": "12345..."`). Every language parses strings losslessly. Convert to `BigInt` in code only if you need to do math on it.

**Does this affect other languages besides JavaScript?**
The risk is worst in JavaScript because all numbers are doubles. Languages with native 64-bit integers can parse them fine — but if a JavaScript client is anywhere in the chain, strings are the safe choice.
