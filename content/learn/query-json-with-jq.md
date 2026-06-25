---
title: "Querying JSON with jq"
metaTitle: "Query JSON with jq: A Practical Guide"
metaDescription: "jq is the command-line tool for slicing, filtering, and reshaping JSON. Learn the core filters — dot, pipe, map, select — with practical examples."
level: intermediate
order: 50
keyTerms: [jq, query json, command line, filter json, json transform]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** **jq** is a command-line tool for slicing, filtering, and reshaping JSON using compact *filter* expressions. The core ideas are the dot (`.`) to access fields, the pipe (`|`) to chain steps, and `map`/`select` to transform and filter arrays. It's ideal for terminals, scripts, and APIs piped from `curl`. To explore a document's shape visually before writing a filter, use the [JSON Tree View](/tools/json-tree-view/).

## The building blocks

A jq program is a **filter**: it takes JSON in and produces JSON out. The simplest filter is `.`, which returns the input unchanged. From there:

```bash
# access a field
echo '{"name":"Ada","age":36}' | jq '.name'        # "Ada"

# access nested fields
jq '.user.address.city' data.json                   # "Paris"

# pipe one filter into the next
jq '.users | length' data.json                      # 3
```

The dot reaches into objects; the pipe feeds one result into the next filter, exactly like a Unix pipe.

## Working with arrays

`.[]` iterates an array; `map()` transforms each element; `select()` keeps elements matching a condition:

```bash
# every user's name (one per line)
jq '.users[].name' data.json

# pull just id and name from each user
jq '.users | map({id, name})' data.json

# keep only active users
jq '.users | map(select(.active))' data.json

# names of active users, as an array
jq '[.users[] | select(.active) | .name]' data.json
```

`map(select(...))` is the everyday "filter a list" idiom. Wrapping a pipeline in `[ ... ]` collects the streamed results back into an array.

## Reshaping output

jq can build new objects and arrays on the fly:

```bash
# rename and flatten
jq '.users | map({user_id: .id, city: .address.city})' data.json

# group and count
jq 'group_by(.role) | map({role: .[0].role, count: length})' data.json
```

Object construction (`{key: expr}`) and array construction (`[expr]`) are how you turn one shape into another — the heart of most real jq scripts.

## jq vs JSONPath

Both query JSON, but they fit different jobs. **JSONPath** is a concise *path* language, often embedded in other languages and tools, great for "pluck this value." **jq** is a full *transformation* language with its own runtime — better when you need to filter, reshape, group, or compute. See [JSONPath](/learn/jsonpath/) for the path-style approach; reach for jq when a path expression isn't enough.

A common pattern is piping an API straight through jq:

```bash
curl -s https://api.example.com/users | jq '.[] | select(.active) | .email'
```

For doing this safely inside scripts, see [Parsing JSON in Bash](/learn/parse-json-in-bash/). To inspect structure before querying, the [JSON Tree View](/tools/json-tree-view/) and [JSON Structure Analyzer](/tools/json-structure-analyzer/) help you find the paths.

## Frequently asked questions

**What is jq used for?**
Querying, filtering, and transforming JSON from the command line. It's the standard tool for processing API responses and JSON files in shell scripts and pipelines.

**What does the pipe do in jq?**
It feeds the output of one filter into the next, like a Unix pipe. `.users | length` first selects the users array, then counts it.

**How do I filter a JSON array in jq?**
Use `map(select(condition))`, e.g. `.users | map(select(.active))` keeps only elements where `active` is truthy. Wrap a streaming pipeline in `[ ... ]` to collect results into an array.

**Should I use jq or JSONPath?**
Use JSONPath to pluck values with a short path expression, especially when it's embedded in another language. Use jq when you need to filter, reshape, group, or compute — it's a full transformation language.
