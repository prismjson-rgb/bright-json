---
title: "The BOM Error: Unexpected Token at Position 0"
metaTitle: "Fix JSON BOM Error (Invisible ﻿ at Position 0)"
metaDescription: "An invisible byte-order mark at the start of a file causes \"Unexpected token ﻿ in JSON at position 0\". Learn how to detect and strip the BOM."
level: practical
order: 32
keyTerms: [byte order mark, bom, feff, json parse error, utf-8]
publishedAt: "2026-06-25"
updatedAt: "2026-06-25"
---

**Quick answer:** A **byte-order mark (BOM)** is three invisible bytes (`EF BB BF`, the character `U+FEFF`) that some editors prepend to UTF-8 files. JSON forbids it, so a BOM at the start of a file causes `Unexpected token ﻿ in JSON at position 0` even though the file *looks* perfect. The fix is to strip the BOM before parsing, or save the file as "UTF-8 without BOM."

## Why the file looks fine but won't parse

The BOM is genuinely invisible in most editors. You see:

```json
{"ok": true}
```

…but the bytes on disk are `EF BB BF 7B 22 6F ...`. Your parser reads the `﻿` first, which isn't a valid start to a JSON document, and throws at position 0. This is maddening precisely because nothing is visibly wrong — copying the text into a fresh file (which drops the BOM) often "fixes" it, hiding the real cause.

The JSON spec ([RFC 8259, §8.1](https://www.rfc-editor.org/rfc/rfc8259#section-8.1)) is explicit: implementations **must not** add a BOM, and parsers *may* reject one. `JSON.parse()` rejects it.

## How to confirm it's a BOM

If `Unexpected token` reports position 0 but the first visible character is clearly valid (`{` or `[`), suspect a BOM. To check the raw bytes:

```bash
head -c 3 data.json | xxd
# 00000000: efbb bf                                  ...
```

`ef bb bf` confirms a UTF-8 BOM. You can also paste the file into the [JSON Debugger](/tools/json-debugger/) — it flags an unexpected character at the very start when a BOM is present.

## How to fix it

**Strip it in code** before parsing:

```js
const clean = raw.replace(/^﻿/, "");
JSON.parse(clean);
```

```python
import json
with open("data.json", encoding="utf-8-sig") as f:   # -sig strips the BOM
    data = json.load(f)
```

Python's `utf-8-sig` codec transparently removes a leading BOM, which is the cleanest fix on that side.

**Fix it at the source** so it never comes back:

- In **VS Code**, click the encoding in the status bar → *Save with Encoding* → *UTF-8* (not *UTF-8 with BOM*).
- In **Notepad / Notepad++**, choose *UTF-8 without BOM* when saving.
- In build pipelines, ensure tools emit BOM-less UTF-8 — it's the standard encoding for JSON.

After cleaning, confirm with the [JSON Validator](/tools/json-validator/).

## Related invisible-character problems

The BOM isn't the only character you can't see. Non-breaking spaces, zero-width spaces, and smart quotes pasted from documents cause similar "but it looks right!" errors. For how JSON handles such characters in general, see [Escaping Special Characters](/learn/escaping-special-chars/), and for the broader list of subtle breakages, [Common JSON Mistakes](/learn/common-mistakes/).

## Frequently asked questions

**What is a BOM in a JSON file?**
A byte-order mark is an invisible character (`U+FEFF`, bytes `EF BB BF` in UTF-8) that some editors add to the start of a file. JSON disallows it, so it triggers a parse error at position 0.

**How do I remove the BOM from JSON?**
Strip a leading `﻿` before parsing (`raw.replace(/^﻿/, "")` in JS), open the file with Python's `utf-8-sig` codec, or re-save it as "UTF-8 without BOM."

**Why does position 0 fail when the first character looks valid?**
Because the actual first character is the invisible BOM, not the `{` you see. The parser meets `﻿` and rejects it immediately.

**How do I stop my editor from adding a BOM?**
Save files as UTF-8 *without* BOM. VS Code, Notepad++, and most editors offer this as an explicit encoding option in the save dialog or status bar.
