---
title: "Parsing JSON in JavaScript"
metaTitle: "Parse JSON in JavaScript: parse, stringify, fetch"
metaDescription: "JSON.parse and JSON.stringify are built into JavaScript. Learn the pitfalls — fetch().json(), reviver functions, dates, and big numbers — that trip people up."
level: intermediate
order: 53
keyTerms: [javascript json, json.parse, json.stringify, fetch json, reviver]
relatedTools: [json-formatter, json-validator]
relatedLearn: [parse-stringify, parse-json-python]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** JavaScript has JSON built in: `JSON.parse()` turns a JSON **string** into a value, and `JSON.stringify()` turns a value into a JSON string. With `fetch`, call `await res.json()` to do the parse for you. The pitfalls are dates, big numbers, and `undefined` — none of which survive a round-trip untouched. Debug a failing parse with the [JSON Debugger](/tools/json-debugger/).

## The two core methods

```js
const obj = JSON.parse('{"name":"Ada","age":36}');   // → { name: "Ada", age: 36 }
const str = JSON.stringify(obj);                      // → '{"name":"Ada","age":36}'

JSON.stringify(obj, null, 2);   // pretty-print with 2-space indent
```

`JSON.parse` only accepts a **string**. A frequent bug is passing an object that's already parsed — it gets coerced to `"[object Object]"` and throws `Unexpected token o`. If you already have an object, you don't need to parse it.

## Fetching JSON

With `fetch`, `res.json()` reads the body *and* parses it:

```js
const res = await fetch("/api/users");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();   // already a JS object
```

Two classic failures here:

- **Calling `.json()` on an error page** throws `Unexpected token <` because the body is HTML, not JSON. Check `res.ok` and the `Content-Type` first — see [Unexpected Token in JSON](/learn/unexpected-token-in-json/).
- **Calling `.json()` on an empty `204` response** throws `Unexpected end of JSON input`. Read `.text()` first and parse only if non-empty — see [Unexpected End of JSON Input](/learn/unexpected-end-of-json-input/).

## What doesn't round-trip cleanly

`JSON.stringify` quietly transforms or drops some values:

- **`Date` → ISO string.** `JSON.stringify(new Date())` emits `"2026-06-25T14:30:00.000Z"`. Parsing it back gives a *string*, not a `Date` — you must re-hydrate it. See [Dates in JSON](/learn/json-dates/).
- **`undefined`, functions, symbols** are **dropped** from objects (and become `null` in arrays). JSON has no `undefined` — see [null vs missing](/learn/json-null-vs-missing/).
- **`NaN` and `Infinity` → `null`.**
- **`BigInt` throws** — `JSON.stringify(1n)` raises a `TypeError`. Convert big integers to strings; see [Big Numbers in JSON](/learn/json-big-numbers/).

## reviver and replacer

Both methods take an optional function to customize the transform:

```js
// reviver: re-hydrate ISO date strings into Date objects
const data = JSON.parse(text, (key, value) =>
  key === "createdAt" ? new Date(value) : value
);

// replacer: drop or transform fields on the way out
JSON.stringify(obj, (key, value) =>
  key === "password" ? undefined : value
);
```

The `replacer` is a clean way to strip sensitive fields before sending. For the underlying serialization rules, see [Parse and Stringify](/learn/parse-stringify/), and wrap parsing of untrusted input in `try/catch` since invalid JSON throws a `SyntaxError`.

## Frequently asked questions

**Do I need to call JSON.parse after fetch?**
No — `await res.json()` reads and parses the body in one step, returning a JavaScript object. Use `JSON.parse` only when you have a raw JSON string yourself.

**Why does JSON.parse throw "Unexpected token o"?**
You passed an object instead of a string. `JSON.parse` stringifies it to `"[object Object]"` and fails. If you already have an object, skip parsing.

**Why did my Date become a string after JSON.stringify?**
JSON has no date type. `stringify` calls the date's `toJSON()` to emit an ISO string, and `parse` returns that string unchanged. Re-create the `Date` with a reviver or after parsing.

**Why are some properties missing after stringify?**
`undefined`, functions, and symbols are dropped from objects during serialization (and turned into `null` inside arrays), because JSON can't represent them.
