---
title: "true vs \"true\": Booleans and Strings in JSON"
metaTitle: "JSON true vs \"true\": Boolean or String?"
metaDescription: "true and \"true\" are different types in JSON, and so are 5 and \"5\". Learn why the quotes matter and how type confusion causes silent bugs."
level: intermediate
order: 46
keyTerms: [json boolean, type coercion, string vs boolean, quotes, json types]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** In JSON, `true` is a **boolean** and `"true"` is a **string** — different types entirely. The same goes for `5` (number) vs `"5"` (string). The quotes are not decoration; they change the type. Mixing them up causes silent bugs, because `"false"` is a non-empty string and therefore *truthy*. Confirm the actual types of a payload in the [JSON Structure Analyzer](/tools/json-structure-analyzer/).

## The quotes decide the type

JSON has exactly [six data types](/learn/six-data-types/). Two of them look confusingly similar in text:

```json
{ "active": true, "label": "true" }
```

`active` is the boolean `true`; `label` is the four-character string `"true"`. Likewise:

```json
{ "count": 5, "code": "5" }
```

`count` is the number 5; `code` is the string `"5"`. A validator or a strongly-typed consumer treats these very differently.

## Why it causes bugs

The nastiest case is a boolean accidentally serialized as a string:

```js
const flag = JSON.parse('{"enabled": "false"}').enabled;
if (flag) {
  // THIS RUNS — "false" is a non-empty string, which is truthy!
}
```

`Boolean("false")` is `true`, because *any* non-empty string is truthy in JavaScript. So a feature you meant to disable stays on. The same trap hits `"0"` (truthy string vs falsy number) and `"null"` (a string, not `null`).

These usually come from:

- **Form data and query strings**, where everything arrives as text (`?enabled=false`).
- **Environment variables**, which are always strings.
- **Spreadsheets / CSV imports**, where types are lost.
- **Over-eager quoting** when hand-writing JSON.

## How to do it right

- **Keep the real type in JSON.** Emit `true`/`false` and numbers without quotes. Generating JSON with `JSON.stringify()` from real booleans and numbers does this automatically — see [Parse and Stringify](/learn/parse-stringify/).
- **Convert at the boundary** when input is unavoidably stringy:

```js
const enabled = String(raw).toLowerCase() === "true";   // explicit, safe
const count = Number(rawCount);                          // not "5" forever
```

- **Validate types with a schema.** `{"type": "boolean"}` rejects `"true"`; `{"type": "integer"}` rejects `"5"`. See [JSON Schema Basics](/learn/json-schema-basics/) and the [JSON Best Practices Checker](/tools/json-best-practices-checker/).

Never test a stringified boolean with a bare truthiness check — compare explicitly.

## Frequently asked questions

**Is `true` the same as `"true"` in JSON?**
No. `true` is a boolean value; `"true"` is a string of four characters. They are different types and behave differently in validation and code.

**Why does `"false"` evaluate as true in my code?**
Because `"false"` is a non-empty string, and non-empty strings are truthy in JavaScript. You're testing the string's truthiness, not its content. Compare explicitly: `value === "true"`.

**Is `5` the same as `"5"` in JSON?**
No. `5` is a number and `"5"` is a string. Arithmetic, sorting, and schema validation all treat them differently, so keep numbers unquoted unless they're genuinely identifiers.

**How do I safely convert a string boolean?**
Compare it explicitly, e.g. `String(value).toLowerCase() === "true"`, rather than relying on truthiness. For numbers, use `Number(value)` and check for `NaN`.
