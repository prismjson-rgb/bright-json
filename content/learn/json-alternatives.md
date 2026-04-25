---
title: "JSON Alternatives: When to Use What"
metaDescription: "Compare JSON with JSON5, JSONC, YAML, TOML, MessagePack, Protobuf, and CBOR so you can choose the right data format."
level: expert
order: 18
keyTerms: []
publishedAt: "2025-12-09"
---

JSON is the right default for most situations. But there are legitimate cases where another format is a better fit. Understanding the alternatives — what they add, what they cost — helps you make an informed choice rather than a cargo-cult one.

## JSON5 — JSON with quality-of-life improvements

JSON5 extends JSON with several features that JavaScript developers often miss:

- Trailing commas in objects and arrays
- Single-quoted strings
- Unquoted object keys
- Line and block comments
- Multi-line strings

```json5
{
  // Server configuration
  host: 'localhost',
  port: 3000,
  allowedOrigins: [
    'https://example.com',
    'https://app.example.com',  // trailing comma OK
  ],
}
```

**Use when:** You control both the writer and the reader, and want the ergonomics without the YAML complexity. Not compatible with `JSON.parse()` — requires the `json5` library.

## JSONC — JSON with comments

JSONC is essentially JSON plus `//` and `/* */` comments. It is not a formal standard but is widely recognized — VS Code uses it for `settings.json` and `tsconfig.json`.

**Use when:** Configuration files that developers edit by hand and want to annotate. Supported by VS Code, TypeScript's compiler, and the `jsonc-parser` library.

## YAML — human-friendly config

YAML is a superset of JSON (any valid JSON is valid YAML 1.2) with significantly more human-friendly syntax for config files:

- Comments with `#`
- No quotes required for simple strings
- Indentation-based structure instead of braces
- Multi-line strings without escaping

```yaml
# Server configuration
host: localhost
port: 3000
allowedOrigins:
  - https://example.com
  - https://app.example.com
```

**Use when:** Configuration that humans write and read frequently — Kubernetes manifests, GitHub Actions, Docker Compose, Ansible. Avoid for API payloads — YAML's whitespace sensitivity makes it error-prone to generate programmatically.

## TOML — config files done right

TOML is designed specifically for config files. It is less ambiguous than YAML and more readable than JSON for nested structures:

```toml
[database]
host = "localhost"
port = 5432
name = "mydb"

[features]
darkMode = true
notifications = false
```

**Use when:** Application configuration files, especially in Rust (Cargo.toml) and Python (pyproject.toml) ecosystems.

## MessagePack — binary JSON

MessagePack is a binary serialization format that encodes the same types as JSON but in a compact binary representation — typically 20–50% smaller than JSON with faster parsing.

**Use when:** High-volume inter-service communication where bandwidth or latency matters and human readability is not needed. Common in game servers, IoT, and real-time systems.

## Protocol Buffers (Protobuf) — schema-first binary

Google's Protobuf requires you to define a `.proto` schema file. It generates strongly-typed code for your language, producing small binary messages.

**Use when:** Internal microservice communication where you need strong typing, versioning, and maximum throughput. The schema requirement is a feature — it catches mismatches at compile time.

## CBOR — Concise Binary Object Representation

An IETF standard (RFC 8949) similar to MessagePack. Designed to be decodable without a schema, like JSON, but in binary.

**Use when:** IoT and constrained devices where you need binary efficiency but cannot use Protobuf's schema requirement.

## How to choose

| Situation | Best choice |
|-----------|-------------|
| Web API | JSON |
| Config file humans edit | YAML or TOML |
| Config file with comments | JSONC or JSON5 |
| High-performance binary | MessagePack or Protobuf |
| Strongly-typed microservices | Protobuf |
| Spreadsheet export | CSV |

## Try it in JSON Prism

If you have data in one of these formats and need it as JSON, the [JSON Converter](/tools/json-converter/) handles the most common conversions. For a detailed side-by-side comparison of JSON with XML and CSV specifically, see [JSON vs XML vs CSV](/learn/json-vs-xml-csv/).
