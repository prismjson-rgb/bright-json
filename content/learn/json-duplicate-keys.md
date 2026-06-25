---
title: "Duplicate Keys in JSON: What Happens"
metaTitle: "Duplicate Keys in JSON: Valid but Dangerous"
metaDescription: "JSON doesn't forbid duplicate object keys, but parsers disagree on what to do. Learn the real behavior, the security risks, and how to avoid them."
level: advanced
order: 45
keyTerms: [duplicate keys, json object, last wins, parser behavior, json security]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** The JSON spec **doesn't forbid** duplicate object keys, but it doesn't define what they mean either — so behavior is parser-dependent. Most parsers keep the **last** value (`{"a":1,"a":2}` → `2`), some keep the first, and a few error or collect both. This ambiguity is a real **security risk** when two systems parse the same payload differently. Avoid duplicates entirely; detect them by inspecting structure in the [JSON Structure Analyzer](/tools/json-structure-analyzer/).

## What the spec says (and doesn't)

[RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) says the names in an object **SHOULD** be unique, but stops short of requiring it. So this is technically valid JSON:

```json
{ "role": "user", "role": "admin" }
```

Because the spec leaves it undefined, every parser is free to choose — and they don't agree.

## How different parsers behave

- **JavaScript `JSON.parse`**, **Python `json`**, **Go `encoding/json`** → **last value wins** (`"admin"` above).
- **Some strict validators** reject duplicates outright.
- **A few libraries** keep the first, or expose all values as a list.

You can't rely on a single answer across languages, which is exactly the problem.

## The security angle

Diverging behavior becomes a vulnerability when **two components parse the same JSON differently**. Imagine an auth gateway and a backend:

```json
{ "user": "alice", "role": "user", "role": "admin" }
```

If the gateway reads the *first* `role` (`"user"`) for its access check but the backend reads the *last* (`"admin"`) when acting, an attacker can smuggle elevated privileges past the check. The same class of confusion enables filter bypasses and request-smuggling-style attacks. For the broader picture, see [JSON Security Considerations](/learn/security/).

## How to avoid duplicates

- **Don't produce them.** Serializers (`JSON.stringify`, `json.dumps`) can't emit duplicate keys from a normal object/dict, so generating JSON from data is inherently safe — see [Parse and Stringify](/learn/parse-stringify/).
- **Reject them on input.** Use a parser or validator that errors on duplicates for untrusted data, or post-process to detect repeated keys before trusting the payload.
- **Inspect suspicious documents.** The [JSON Structure Analyzer](/tools/json-structure-analyzer/) surfaces the object's actual keys so repeats stand out, and the [JSON Validator](/tools/json-validator/) confirms overall validity.
- **Pin behavior** in security-sensitive code: parse once, in one place, and pass the resulting object around — never re-parse the raw text in a component that might disagree.

## Frequently asked questions

**Are duplicate keys valid in JSON?**
Technically yes — the spec says keys *should* be unique but doesn't forbid duplicates. Whether a parser accepts them, and which value it keeps, is undefined by the standard.

**Which value wins with duplicate keys?**
Most mainstream parsers (JavaScript, Python, Go) keep the **last** occurrence. But some keep the first, and some reject the input, so the behavior isn't portable.

**Are duplicate keys a security risk?**
Yes. If two systems parse the same payload and disagree on which duplicate wins, an attacker can slip different values past a check and into the action — a real source of auth-bypass and smuggling bugs.

**How do I prevent duplicate keys?**
Generate JSON with a serializer (which can't emit duplicates), and validate untrusted input with a parser that rejects them. Parse once and reuse the object rather than re-parsing the raw text.
