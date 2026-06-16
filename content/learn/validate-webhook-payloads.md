---
title: "How to Validate Webhook JSON Payloads"
metaTitle: "Validate Webhook JSON Payloads (The Right Way)"
metaDescription: "Webhooks from Stripe, GitHub, and Shopify send JSON you don't control. Learn how to inspect, validate, and schema-check webhook payloads safely."
level: intermediate
order: 25
keyTerms: [webhook payload, validate webhook, stripe webhook, github webhook, json schema]
publishedAt: "2026-06-16"
updatedAt: "2026-06-16"
---

**Quick answer:** A webhook delivers JSON your system didn't generate, so validate it before trusting it: first confirm it's syntactically valid JSON, then check it against a [JSON Schema](/learn/json-schema-basics/) that asserts the fields and types you depend on. To inspect a captured payload by hand, paste it into the [JSON Validator](/tools/json-validator/) and explore it in the [Tree View](/tools/json-tree-view/). Never assume the shape — verify it.

## Why webhook payloads need validation

With a webhook, an external service (Stripe, GitHub, Shopify, Slack) POSTs JSON to your endpoint when an event happens. You don't control that payload, and it can surprise you:

- **The provider changes the shape.** A new API version adds, renames, or nests fields.
- **Optional fields are missing.** A field present in the docs' example isn't always present in every event.
- **Types differ from expectations.** An amount arrives as a string `"1000"` rather than a number, or a timestamp format changes.
- **Malformed or partial bodies** from retries, proxies, or truncation.

If your handler reaches straight into `payload.data.object.amount` without checking, any of these breaks it — often silently, in production.

## Step 1 — Inspect a captured payload

Capture a real delivery (most providers let you view recent webhook events and copy the raw body) and paste it into JSON Prism:

- The [JSON Validator](/tools/json-validator/) confirms the body is valid JSON and points to any syntax errors.
- The [Tree View](/tools/json-tree-view/) lets you drill into the actual structure and read exact field names and types — far safer than trusting the documentation example.
- The [Structure Analyzer](/tools/json-structure-analyzer/) summarizes key counts and nesting depth so you understand how deep the data goes.

## Step 2 — Validate against a schema

Once you know the shape you depend on, encode it as a [JSON Schema](/learn/json-schema-basics/) and validate every incoming payload against it. A minimal schema for a payment event might require an `id`, an `amount` that's an integer, and a `currency` string:

```json
{
  "type": "object",
  "required": ["id", "amount", "currency"],
  "properties": {
    "id": { "type": "string" },
    "amount": { "type": "integer" },
    "currency": { "type": "string", "minLength": 3, "maxLength": 3 }
  }
}
```

Validating against a schema in your handler turns "the provider quietly changed something" from a mysterious production bug into an explicit, logged validation failure you can alert on.

## Step 3 — Verify authenticity separately

Schema validation proves the payload is *well-formed*, not that it's *genuine*. Webhooks should also be verified with the provider's **signature** (an HMAC in a header like `Stripe-Signature` or `X-Hub-Signature-256`). Always check the signature against the raw request body before parsing — never trust an unsigned webhook, and don't let JSON validation replace signature verification. For more on safe handling of untrusted JSON, see [JSON Security](/learn/security/).

## A practical checklist

- ✅ Verify the provider signature against the raw body first
- ✅ Confirm the body parses as valid JSON
- ✅ Validate required fields and types against a schema
- ✅ Handle missing optional fields gracefully
- ✅ Log and alert on validation failures rather than swallowing them

## Frequently asked questions

**How do I validate a webhook payload?**
Confirm it's valid JSON, then check it against a [JSON Schema](/learn/json-schema-basics/) asserting the fields and types you rely on. Inspect captured payloads in the [JSON Validator](/tools/json-validator/) and [Tree View](/tools/json-tree-view/) first.

**Is validating JSON the same as verifying a webhook?**
No. Validation checks the data's shape; verification checks its authenticity via the provider's signature. Do both — signature first, then schema.

**Why do webhook payloads break my handler?**
Usually because the provider changed the shape, omitted an optional field, or sent an unexpected type. Schema validation catches these explicitly instead of failing deep in your code.

**Can I test a webhook payload without sending a request?**
Yes. Copy the raw body from your provider's event log and paste it into the [JSON Validator](/tools/json-validator/) to inspect and validate it locally — nothing is uploaded.
