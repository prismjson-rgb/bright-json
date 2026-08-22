---
title: "JSON in PostgreSQL: json vs jsonb"
metaTitle: "JSON in PostgreSQL: json vs jsonb Explained"
metaDescription: "Postgres has two JSON types. Learn why jsonb is almost always the right choice, how to query it with -> and ->>, and how to index it with GIN."
level: advanced
order: 54
keyTerms: [postgresql json, jsonb, gin index, json query, database json]
relatedTools: [json-formatter, json-validator]
relatedLearn: [json-schema-basics, parse-stringify]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** PostgreSQL has two JSON column types: **`json`** stores the exact text, while **`jsonb`** stores a parsed binary form. Use **`jsonb`** almost always — it's faster to query and can be indexed, at the cost of slightly slower writes. Query it with the `->`, `->>`, and `@>` operators, and index it with **GIN**. To validate a document before storing it, use the [JSON Validator](/tools/json-validator/).

## json vs jsonb

| | `json` | `jsonb` |
| --- | --- | --- |
| Storage | Exact input text | Decomposed binary |
| Preserves whitespace / key order | Yes | No |
| Preserves duplicate keys | Yes (keeps last on read) | No (last wins, deduped) |
| Query speed | Slower (re-parses) | Faster |
| Indexable (GIN) | No | Yes |
| Write speed | Faster | Slightly slower |

`json` only makes sense when you need to store and return the *exact original text* byte-for-byte. For anything you'll **query**, `jsonb` wins. Note that `jsonb` drops insignificant whitespace and de-duplicates keys (keeping the last) — see [Duplicate Keys in JSON](/learn/json-duplicate-keys/).

## Querying jsonb

The key operators:

```sql
-- -> returns a json/jsonb value; ->> returns text
SELECT data -> 'user' -> 'name'  AS name_json,   -- "Ada" (jsonb)
       data ->> 'status'         AS status_text  -- Ada    (text)
FROM events;

-- deep path with #>> (text) or #> (jsonb)
SELECT data #>> '{user,address,city}' FROM events;

-- containment: does data contain this fragment?
SELECT * FROM events WHERE data @> '{"status": "active"}';

-- key existence
SELECT * FROM events WHERE data ? 'email';
```

Remember `->` keeps the JSON type (good for chaining), while `->>` extracts **text** (good for comparing to a string or casting). To compare a numeric field, cast it: `(data ->> 'age')::int > 30`.

## Indexing for speed

Without an index, every JSON query scans and parses each row. A **GIN index** makes containment and key lookups fast:

```sql
-- general-purpose: supports @>, ?, ?| , ?&
CREATE INDEX idx_events_data ON events USING GIN (data);

-- smaller/faster for @> only
CREATE INDEX idx_events_data ON events USING GIN (data jsonb_path_ops);
```

For a single hot field, an expression B-tree index can beat GIN:

```sql
CREATE INDEX idx_events_status ON events ((data ->> 'status'));
```

## When to use jsonb (and when not to)

`jsonb` is great for **semi-structured or variable** data: event payloads, settings, third-party API blobs. It is **not** a replacement for normalized columns — fields you filter, join, and constrain on belong in real columns with their own types and indexes. A common pattern is a hybrid: structured columns for the core fields, a `jsonb` column for the flexible extras. To explore an unfamiliar payload's shape before deciding what to promote to columns, use the [JSON Structure Analyzer](/tools/json-structure-analyzer/).

## Frequently asked questions

**Should I use json or jsonb in PostgreSQL?**
Use `jsonb` in almost all cases — it's faster to query and supports indexing. Only use `json` if you must preserve the exact original text, key order, and whitespace.

**How do I query a JSON field in Postgres?**
Use `->` to get a JSON value, `->>` to get text, and `#>`/`#>>` for deep paths. Use `@>` for containment and `?` for key existence. Cast extracted text for typed comparisons, e.g. `(data->>'age')::int`.

**How do I index a jsonb column?**
Create a GIN index (`USING GIN (data)`) for containment and key queries, or `jsonb_path_ops` for a smaller `@>`-only index. For one frequently filtered field, an expression B-tree index on `data->>'field'` can be faster.

**Is jsonb a replacement for normal columns?**
No. Use it for variable or semi-structured data. Fields you regularly filter, join, or constrain on should be real typed columns; a hybrid of both is common.
