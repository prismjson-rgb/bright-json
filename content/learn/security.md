---
title: JSON Security Best Practices
level: expert
order: 17
metaTitle: "JSON Security: Injection, Deserialization, and Validation"
metaDescription: "Secure your JSON handling: prevent injection, validate with schema, limit depth, sanitize output. Enterprise security guide."
keyTerms: []
relatedTools: [json-best-practices-checker, json-validator]
relatedLearn: [validate-webhook-payloads, escaping-special-chars]
publishedAt: "2025-12-11"
---

JSON is a data format, not an execution format — but that does not make it safe by default. When your application receives JSON from an untrusted source (a user, a third-party API, a webhook), a range of security issues can arise if you process it without care.

## Never use eval() to parse JSON

The classic mistake. `eval()` executes arbitrary JavaScript, so if an attacker controls the JSON string, they control what runs in your application.

Dangerous (never do this):

```javascript
const data = eval("(" + jsonString + ")");
```

Always use `JSON.parse()`, which only parses data — it cannot execute code:

```javascript
const data = JSON.parse(jsonString); // safe
```

## Validate with a schema before trusting data

Syntactically valid JSON can still be semantically harmful. An API that expects `{"role": "viewer"}` might be abused by sending `{"role": "admin"}`. Schema validation enforces what your business logic actually allows:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "role": {"type": "string", "enum": ["viewer", "editor"]}
  },
  "required": ["role"],
  "additionalProperties": false
}
```

`additionalProperties: false` is especially important — it prevents unexpected keys from being processed by downstream code.

## Limit parsing depth to prevent stack overflow

Deeply nested JSON can exhaust the call stack when parsers use recursive descent. An attacker can craft a document with thousands of nesting levels to cause a crash. Enforce depth limits in your parsing layer:

```json
{
  "a": {"a": {"a": {"a": {"a": {"a": "...hundreds of levels..."}}}}}}
}
```

Most schema validators let you set `maxDepth`. Alternatively, reject documents above a set byte size before parsing.

## Prevent JSON injection into SQL and other systems

Never build SQL queries or command strings by concatenating JSON values:

```javascript
// Dangerous
const query = `SELECT * FROM users WHERE id = ${data.id}`;

// Safe: use parameterized queries
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [data.id]);
```

The same applies to LDAP queries, shell commands, and any system that treats input as code.

## Prevent XSS when rendering JSON in HTML

If you embed JSON into an HTML page (for server-side rendering), HTML-special characters in JSON values can break out of their context:

```javascript
// Dangerous: if value contains </script>, it breaks the page
const html = `<script>var data = ${JSON.stringify(data)};</script>`;
```

Escape `</` to `<\/` before embedding, or use a library that does this automatically.

## Beware of prototype pollution

In JavaScript, a JSON object with the key `__proto__` can pollute the prototype of all objects in your application:

```json
{"__proto__": {"isAdmin": true}}
```

Use `JSON.parse()` (which does not trigger this in modern runtimes) and avoid merging untrusted JSON into plain objects with `Object.assign` or spread without sanitizing the keys first.

## Protect against ReDoS in schema patterns

If your JSON Schema uses `pattern` keywords with complex regular expressions, an attacker can craft string values that cause catastrophic backtracking in the regex engine, consuming 100% CPU. Keep regex patterns simple or use a ReDoS-safe regex engine.

## Rate limit and size limit JSON payloads

Set a maximum request body size on your API server. A 100MB JSON payload parsed in full before rejection wastes server resources. Reject oversized payloads at the HTTP layer before your application code touches them.

## Try it in JSON Prism

The [JSON Validator](/tools/json-validator/) checks syntactic correctness before you process JSON. The [JSON Best Practices Checker](/tools/json-best-practices-checker/) flags structural patterns that commonly lead to bugs and security issues in production applications.
