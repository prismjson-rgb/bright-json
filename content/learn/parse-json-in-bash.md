---
title: "Parsing JSON in Bash with jq"
metaTitle: "Parse JSON in Bash: curl, jq, and Safe Scripts"
metaDescription: "Bash can't parse JSON natively — use jq. Learn how to pipe curl into jq, extract values into variables, loop over arrays, and avoid the common traps."
level: intermediate
order: 55
keyTerms: [bash json, jq, curl json, shell script, parse json]
relatedTools: [json-formatter]
relatedLearn: [query-json-with-jq, parse-stringify]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** Bash has **no native JSON parser** — don't use `grep`/`sed`/`awk` on JSON, it breaks on nesting and escaping. Use **`jq`**: pipe `curl` output into it to extract fields, populate variables, and loop over arrays. The golden rule is to let jq do the parsing and feed clean values into the shell. For the full jq filter language, see [Querying JSON with jq](/learn/query-json-with-jq/).

## curl into jq

The everyday pattern is one pipe:

```bash
curl -s https://api.example.com/user | jq '.name'
# "Ada"

# -r strips the quotes so it's a plain shell string
curl -s https://api.example.com/user | jq -r '.name'
# Ada
```

`-s` silences curl's progress meter; `jq -r` (raw output) removes the surrounding quotes so the value is usable as a normal string. Without `-r`, `.name` stays `"Ada"` *with* quotes, which is rarely what you want in a script.

## Extracting into shell variables

Capture a single value:

```bash
name=$(curl -s "$URL" | jq -r '.user.name')
echo "Hello, $name"
```

Read several fields at once without parsing repeatedly — emit them on lines and `read` them:

```bash
read -r id name <<< "$(jq -r '.id, .name | @text' user.json | paste -sd' ')"
```

Or, cleaner for multiple values, output a tab-separated row and split:

```bash
jq -r '[.id, .name, .email] | @tsv' user.json | while IFS=$'\t' read -r id name email; do
  echo "$id -> $name <$email>"
done
```

`@tsv` (and `@csv`) safely encode values, handling embedded tabs, quotes, and newlines that would otherwise corrupt your loop.

## Looping over a JSON array

The safe way to iterate is to have jq emit **compact, one-per-line** objects and read each line:

```bash
curl -s "$URL" | jq -c '.users[]' | while read -r user; do
  name=$(jq -r '.name' <<< "$user")
  echo "User: $name"
done
```

`jq -c` prints each element on a single line (compact), so one `read` gets one whole record. This is essentially treating the stream as [JSONL](/learn/json-vs-jsonl/).

## Common traps

- **Don't parse JSON with `grep`/`sed`.** It appears to work until a value contains a brace, a quote, or a newline — then it silently returns garbage. Use jq.
- **Quote your variables** (`"$user"`, `"$name"`) so values with spaces don't word-split.
- **Check that the response is JSON.** If `curl` returned an HTML error page, jq prints a parse error — guard with the HTTP status (`curl -fsS` fails on HTTP errors). See [Unexpected Token in JSON](/learn/unexpected-token-in-json/).
- **Use `// empty` or `//` defaults** for missing keys: `jq -r '.nickname // "n/a"'`.

To prototype a jq filter against a sample document before scripting it, paste the JSON into the [JSON Tree View](/tools/json-tree-view/) to find the right paths.

## Frequently asked questions

**How do I parse JSON in a bash script?**
Use `jq`. Pipe your JSON (often from `curl -s`) into a jq filter, and use `jq -r` to get raw, unquoted values suitable for shell variables. Bash has no built-in JSON parser.

**Why shouldn't I use grep or sed on JSON?**
JSON nesting, quoting, and escaping make line-based tools unreliable — they break the moment a value contains a brace, quote, or newline. jq parses the structure correctly.

**How do I loop over a JSON array in bash?**
Emit one compact element per line with `jq -c '.array[]'` and `read` each line in a `while` loop. Parse fields from each element with another `jq -r` call.

**How do I get a value without the surrounding quotes?**
Use `jq -r` (raw output), e.g. `jq -r '.name'`. Without `-r`, jq prints JSON-encoded strings that keep their double quotes.
