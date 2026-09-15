---
title: What is JSON?
level: beginner
order: 1
metaTitle: "What is JSON? A Complete Introduction for Beginners"
metaDescription: "JSON (JavaScript Object Notation) is a lightweight data format used by web APIs and applications. Learn what JSON is, why it exists, and when to use it."
keyTerms: [JSON, data interchange, API, lightweight, text-based]
relatedTools: [json-formatter, json-validator]
relatedLearn: [six-data-types, syntax-rules, json-vs-xml-csv]
publishedAt: "2025-12-01"
updatedAt: "2026-09-15"
---

JSON stands for JavaScript Object Notation. It is a lightweight, text-based format for storing and exchanging data between systems. Standardized as ECMA-404 and [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html), JSON is widely used by web APIs. It is human-readable and straightforward for programs to parse.

## What does JSON look like?

A JSON text can contain any JSON value: an object, array, string, number, boolean, or null. Objects contain named key-value pairs in curly braces. Here is an object representing a user:

```json
{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "active": true,
  "roles": ["admin", "editor"],
  "address": {
    "city": "New York",
    "country": "US"
  }
}
```

Every key is a string in double quotes. Values can be strings, numbers, booleans, arrays, objects, or null. That is the entire type system.

## Why was JSON invented?

Before JSON, XML was the dominant data exchange format for the web. XML is verbose - every value needs an opening and closing tag. Douglas Crockford noticed that JavaScript already had a natural object literal syntax, and he formalized it into a language-independent standard. The result is a format that is:

- Smaller than XML for the same data
- Readable without special tooling
- Natively parsed by every major programming language
- Trivial to generate from any data structure

## Where is JSON used?

JSON is everywhere in modern software:

- **REST APIs** - many web APIs exchange JSON requests and responses
- **Configuration files** - `package.json`, `tsconfig.json`, VS Code settings
- **Databases** - PostgreSQL, MySQL, and MongoDB store JSON natively
- **Browser storage** - `localStorage` and `sessionStorage` store JSON strings
- **Message queues** - Kafka, RabbitMQ payloads are often JSON
- **Log files** - structured logging commonly uses JSON lines

## How does JSON compare to other formats?

JSON is not the only option, but it is usually the best default:

- **vs XML** - JSON often uses less markup for comparable data, but size depends on the document
- **vs CSV** - CSV is great for flat tabular data but cannot represent nested structures
- **vs YAML** - YAML supports comments and is popular for config, but is whitespace-sensitive and error-prone
- **vs MessagePack** - MessagePack is a binary format that is faster and smaller, but not human-readable

For a deeper comparison, see [JSON vs XML vs CSV](/learn/json-vs-xml-csv/).

## Is JSON the same as a JavaScript object?

No. JSON is a text format; a JavaScript object is a value in memory. After parsing JSON text, JavaScript may produce an object, array, or primitive. The key differences:

- JSON keys must always be in double quotes - JavaScript allows unquoted keys
- JSON does not support functions, `undefined`, or `Date` objects
- JSON is language-independent - Python, Go, Java, and Rust all parse it natively

## Try it in JSON Prism

Paste any JSON into the [JSON Formatter](/tools/json-formatter/) to instantly pretty-print and explore it. Run it through the [JSON Validator](/tools/json-validator/) to confirm it is syntactically correct before using it in your code.
