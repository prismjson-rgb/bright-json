---
title: Common JSON Patterns
level: comfortable
order: 7
metaTitle: "Common JSON Patterns: API Responses, Configs, and More"
metaDescription: "Learn the most common JSON patterns: list of objects, nested config, key-value lookup. Copy-paste ready examples."
keyTerms: []
relatedTools: [json-mock-generator, json-visual-editor]
relatedLearn: [objects-arrays-depth, json-schema-basics, json-in-apis]
publishedAt: "2025-12-05"
---

JSON is flexible enough to represent almost any data structure, but a handful of patterns appear in the vast majority of real-world applications. Recognizing them makes it faster to read unfamiliar JSON and design your own APIs and config files.

## Pattern 1: List of objects (API responses)

The most common pattern — an array of uniform objects. Used by almost every REST API list endpoint. Each object has the same keys, making it easy to loop through and render in a table or list.

```json
[
  {"id": 1, "name": "Alice", "email": "alice@example.com", "role": "admin"},
  {"id": 2, "name": "Bob", "email": "bob@example.com", "role": "viewer"}
]
```

When returned by an API, this is usually wrapped in an envelope:

```json
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 2
  }
}
```

## Pattern 2: Nested configuration

Objects inside objects for grouping related settings. This pattern is ubiquitous in config files — `package.json`, `tsconfig.json`, Docker Compose, and countless application configs all use it.

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb",
    "ssl": true
  },
  "features": {
    "darkMode": true,
    "notifications": false,
    "betaFeatures": ["ai-search", "bulk-export"]
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

## Pattern 3: Key-value lookup (dictionary)

A flat object used as a map from key to value. Great for lookup tables: currency exchange rates, HTTP status code descriptions, i18n translations, or feature flags.

```json
{
  "USD": 1.0,
  "EUR": 0.92,
  "GBP": 0.79,
  "JPY": 149.50
}
```

i18n translations:

```json
{
  "welcome": "Welcome back, {name}!",
  "logout": "Sign out",
  "error.notFound": "Page not found"
}
```

## Pattern 4: Polymorphic list with type discriminator

When a list can contain objects of different shapes, add a `type` field so consumers know how to handle each item:

```json
[
  {"type": "text", "content": "Hello world"},
  {"type": "image", "url": "https://example.com/photo.jpg", "alt": "A photo"},
  {"type": "video", "url": "https://example.com/clip.mp4", "duration": 30}
]
```

## Pattern 5: Tree / recursive structure

A node that can contain children of the same shape. Used for navigation menus, file system trees, org charts, and comment threads.

```json
{
  "id": 1,
  "label": "Root",
  "children": [
    {
      "id": 2,
      "label": "Branch A",
      "children": [
        {"id": 4, "label": "Leaf 1", "children": []},
        {"id": 5, "label": "Leaf 2", "children": []}
      ]
    },
    {
      "id": 3,
      "label": "Branch B",
      "children": []
    }
  ]
}
```

## Pattern 6: Event / log record

A flat object with a timestamp, event type, and payload. Used in event-driven systems, audit logs, and analytics pipelines.

```json
{
  "timestamp": "2024-01-15T09:32:47Z",
  "event": "user.login",
  "userId": "usr_abc123",
  "ip": "192.168.1.1",
  "metadata": {
    "browser": "Chrome",
    "os": "macOS"
  }
}
```

## Try it in JSON Prism

Paste any of these patterns into the [JSON Formatter](/tools/json-formatter/) to explore the structure. Need realistic sample data? The [JSON Mock Generator](/tools/json-mock-generator/) creates JSON that matches any of these patterns so you can test your code without calling a real API.
