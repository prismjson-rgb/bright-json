---
title: JSON Notes
metaTitle: JSON Notes Workspace | Keep Working Notes Beside JSON
metaDescription: Store working notes, observations, and task context next to the active JSON document inside the browser workspace.
summary: Add context to payload reviews without switching into a separate notes app.
category: Collaborate
appHref: /app/?tool=json-notes
badge: Context
order: 17
keywords: [json annotation tool, json documentation, json comment workaround, annotate json fields]
relatedTools: [json-share-links, json-visual-editor]
relatedLearn: [common-patterns, json-schema-basics]
highlights:
  - Keep notes with the payload
  - Helpful during reviews
  - Stored locally in the browser
useCases:
  - Investigation notes
  - QA review
  - Documentation drafting
faqs:
  - question: "What are JSON Notes?"
    answer: "JSON Notes lets you attach plain-text annotations to specific parts of a JSON document. Select a key or value, write a note, and the annotation is pinned to that location. Notes are useful for documenting what a field means, flagging problems to fix, or leaving context for a colleague reviewing the same JSON."
  - question: "Are notes saved automatically?"
    answer: "Notes are saved in your browser's local storage automatically as you type. They persist across page refreshes. If you want to share annotated JSON with someone else, use the share link feature — it can include your notes."
  - question: "Can I annotate an API response with JSON Notes?"
    answer: "Yes. Paste any JSON — including API responses — and add notes explaining each field. This is useful for documenting undiscovered APIs, writing handoff notes, or creating annotated examples for team documentation."
  - question: "Do notes change the JSON itself?"
    answer: "No. Notes are a separate layer of annotation stored alongside the JSON, not inside it. The raw JSON you copy out is always the original, unannotated data. Notes only appear in the JSON Prism interface."
---
JSON Notes gives you a dedicated space to write working notes directly alongside the active payload in the JSON Prism workspace. Instead of flipping between a notepad app and your browser, you keep observations, questions, decisions, and task context in the same view as the JSON you are analyzing.

## How to use JSON Notes

1. Open the [JSON Notes](/app/?tool=json-notes) panel inside the JSON Prism app.
2. Paste your JSON payload into the main editor as normal.
3. Open the Notes panel — it appears alongside the editor without replacing it.
4. Type your observations, field annotations, open questions, or next steps directly in the notes area.
5. Notes are stored locally in the browser. They persist across page reloads on the same device.
6. When you are done, copy your notes out to a ticket, document, or handoff message.

## Problems it solves

When you review a complex payload, you are making decisions in real time — which fields matter, what looks wrong, what needs a follow-up. Without a place to capture that reasoning, the context disappears once you close the tab:

- Prevents losing observations made during a debugging or QA session
- Keeps field-level annotations next to the payload instead of in a separate file
- Reduces context switching by eliminating the need to alt-tab into a notes app mid-review
- Helps when handing work off — notes describe the reasoning behind what you found, not just what the JSON looks like
- Useful for documenting schema decisions during an API design session before anything is formally written down

## Example scenario

Say you receive this payload and need to review it before a deployment:

```json
{
  "orderId": "ord_9921",
  "status": "pending",
  "items": [
    { "sku": "WIDGET-A", "qty": 3, "price": 14.99 },
    { "sku": "GADGET-X", "qty": 1, "price": 49.00 }
  ],
  "shipping": {
    "method": "ground",
    "estimatedDays": null
  }
}
```

While reviewing, you notice `estimatedDays` is `null`. With JSON Notes open, you write: "estimatedDays is null for pending orders — confirm with backend team whether this is expected or a bug before deploying." That note stays visible next to the payload while you continue reviewing the rest of the fields.

## When to use it

- **QA review sessions** — Annotate fields that look suspicious and capture what needs verification before signing off.
- **Debugging** — Track what you have already checked and what hypotheses you are testing so you do not repeat steps.
- **API design review** — Write down decisions made about field naming, nullability, and types while the payload is in front of you.
- **Async handoff** — Leave notes in the workspace, then share the payload and your observations together with a colleague.
- **Documentation drafting** — Use the notes area as a scratch space for API field descriptions before pasting them into formal docs.

After annotating, use the [JSON Formatter](/tools/json-formatter/) to clean up indentation before sharing. For side-by-side comparison of two payloads, use the [JSON Diff Viewer](/tools/json-diff-viewer/). For broader JSON workflow patterns, see [Common JSON Patterns](/learn/common-patterns/).
