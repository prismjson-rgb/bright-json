---
title: Common JSON Patterns
level: comfortable
order: 7
metaTitle: "Common JSON Patterns: API Responses, Configs, and More"
metaDescription: "Learn the most common JSON patterns: list of objects, nested config, key-value lookup. Copy-paste ready examples."
keyTerms: []
---

These patterns appear everywhere in real applications.

## List of Objects (API responses)

The most common pattern — an array of uniform objects. Used by almost every REST API.

```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com"},
  {"id": 2, "name": "Bob", "email": "bob@example.com"}
]
```

## Nested Configuration

Objects inside objects for grouping. Perfect for app config, feature flags, and settings.

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb"
  },
  "features": {
    "darkMode": true,
    "notifications": false
  }
}
```

## Key-Value Lookup (Dictionary)

Flat object as a map. Great for currency rates, translations, or status codes.

```json
{
  "USD": 1.0,
  "EUR": 0.92,
  "GBP": 0.79,
  "JPY": 149.50
}
```
