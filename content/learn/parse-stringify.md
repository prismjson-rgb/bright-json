---
title: Parsing and Stringifying
level: practical
order: 10
metaTitle: "JSON.parse() and JSON.stringify() — Complete Guide"
metaDescription: "Convert JSON text to objects with JSON.parse. Convert objects to JSON with JSON.stringify. Learn revivers, replacers, and pretty-printing."
keyTerms: []
publishedAt: "2025-12-08"
---

`JSON.parse()` converts a JSON string into a JavaScript object. `JSON.stringify()` does the opposite — it converts a JavaScript object into a JSON string. These two functions are the core of JSON handling in the browser and Node.js. Every other language has equivalents with the same semantics.

## JSON.parse() — string to object

```json
{"name": "Alice", "age": 30, "active": true}
```

```javascript
const str = '{"name":"Alice","age":30,"active":true}';
const obj = JSON.parse(str);

console.log(obj.name);   // "Alice"
console.log(obj.age);    // 30
console.log(obj.active); // true
```

If the input is not valid JSON, `JSON.parse()` throws a `SyntaxError` with a message indicating the position of the problem. Always wrap it in try/catch when parsing untrusted input:

```javascript
try {
  const data = JSON.parse(untrustedString);
} catch (err) {
  console.error("Invalid JSON:", err.message);
}
```

## JSON.stringify() — object to string

```javascript
const user = { name: "Alice", age: 30, active: true };

// Compact (minified)
const compact = JSON.stringify(user);
// '{"name":"Alice","age":30,"active":true}'

// Pretty-printed with 2-space indent
const pretty = JSON.stringify(user, null, 2);
```

The output of `JSON.stringify(user, null, 2)`:

```json
{
  "name": "Alice",
  "age": 30,
  "active": true
}
```

## What gets dropped by JSON.stringify()?

`JSON.stringify()` silently drops properties it cannot represent in JSON:

- `undefined` values are omitted
- Functions are omitted
- `Symbol` keys are omitted
- `NaN` and `Infinity` become `null`

```javascript
const obj = {
  name: "Alice",
  fn: () => {},
  score: NaN,
  limit: Infinity
};

JSON.stringify(obj);
// '{"name":"Alice","score":null,"limit":null}'
```

## Using a replacer to filter or transform

The second argument to `JSON.stringify()` can be an array of keys to include, or a function that transforms values:

```javascript
const user = { name: "Alice", password: "secret", age: 30 };

// Include only specific keys
JSON.stringify(user, ["name", "age"]);
// '{"name":"Alice","age":30}'
```

## Using a reviver to transform on parse

The second argument to `JSON.parse()` is a reviver function — useful for converting date strings back to `Date` objects:

```javascript
const str = '{"name":"Alice","createdAt":"2024-01-15T00:00:00Z"}';

const obj = JSON.parse(str, (key, value) => {
  if (key === "createdAt") return new Date(value);
  return value;
});

console.log(obj.createdAt instanceof Date); // true
```

## Equivalents in other languages

- Python: `json.loads()` / `json.dumps()`
- PHP: `json_decode()` / `json_encode()`
- Go: `json.Unmarshal()` / `json.Marshal()`
- Java: Jackson `ObjectMapper.readValue()` / `writeValueAsString()`
- Ruby: `JSON.parse()` / `JSON.generate()`

## Try it in JSON Prism

Paste a JSON string into the [JSON Formatter](/tools/json-formatter/) to visualize what `JSON.parse()` would produce. Run it through the [JSON Validator](/tools/json-validator/) first if you suspect the string may be malformed — it will catch the issue before your code throws a runtime error.
