---
title: JSON Bundle Viewer
metaTitle: JSON Bundle Viewer | Open Multiple JSON Documents in One Link
metaDescription: Package multiple JSON documents into one shareable bundle so teams can open related payloads together.
summary: Group several JSON documents into one portable, review-friendly bundle.
category: Bundle
appHref: /bundle/
badge: Multi-document
order: 18
keywords: [json bundle, share multiple json files, json bundle viewer]
highlights:
  - Share related JSON together
  - Better for repro sets
  - Useful for demos and bug reports
useCases:
  - Multi-payload support cases
  - Demo bundles
  - Handoff packages
faqs:
  - question: "What is the JSON Bundle Viewer?"
    answer: "The Bundle Viewer lets you load multiple JSON files at once and view them as a collection. You can switch between files, compare their structures, and navigate them all within a single interface without opening separate tabs or tools."
  - question: "How do I load multiple JSON files into the bundle viewer?"
    answer: "Drag and drop multiple .json files onto the bundle viewer, or use the file picker to select several files at once. Each file appears as a tab or entry in the file list. You can also paste multiple JSON documents separated by a delimiter."
  - question: "Can I diff two files in the bundle viewer?"
    answer: "Yes. Select any two files in your bundle and click Compare. The diff view opens with those two files side by side, highlighting structural and value differences. You can then return to the bundle and compare other pairs."
  - question: "What is the maximum number of files I can view at once?"
    answer: "The bundle viewer handles dozens of files comfortably. For very large collections (hundreds of files), performance depends on file sizes. The viewer loads files lazily — it only fully parses a file when you navigate to it — so even large bundles load quickly."
---
The JSON Bundle Viewer lets you package multiple JSON documents into a single shareable link. Instead of sending three separate URLs or attaching multiple files to a ticket, you open everything in one view where each document is accessible by tab. This is particularly useful when the context of a bug or integration only makes sense when you can see the request, the response, and the config side by side.

## How to use the JSON Bundle Viewer

1. Go to the [JSON Bundle Viewer](/bundle/) page.
2. Click "Add Document" to add your first JSON payload and give it a label — for example "Request" or "Config".
3. Repeat for each related payload. Bundles support multiple named documents.
4. Click "Create Bundle Link" to generate a single shareable URL that opens all documents together.
5. Share that URL in a ticket, PR comment, or Slack message.
6. Recipients open the link and can switch between each named document in the viewer without any additional setup.

## Problems it solves

A single JSON payload rarely tells the full story. API bugs usually require a request body, a response body, and sometimes a config or schema to diagnose properly. Sharing these as separate links breaks the context:

- Groups related payloads so reviewers see everything in one place
- Eliminates "which link goes with which payload" confusion when sharing multiple files
- Preserves the narrative — label each document so the sequence is clear (e.g. "Step 1 Request", "Step 1 Response", "Step 2 Request")
- Reduces back-and-forth in support cases where support needs the full request-response pair, not just one side
- Useful for demos where you want to walk through multiple API calls in a controlled sequence

## Example: a multi-payload bug report

A bundle might contain:

```json
{
  "bundle": "Checkout flow error",
  "documents": [
    { "label": "POST /cart/checkout — request" },
    { "label": "POST /cart/checkout — response (422)" },
    { "label": "Product config at time of error" }
  ]
}
```

Each of those documents contains the real JSON payload. The reviewer opens the bundle link and can tab between all three without jumping between browser tabs.

## When to use it

- **Multi-step API bug reproductions** — A repro that requires three API calls is much clearer as a bundle than three separate share links.
- **Support cases** — Customers or support agents can attach a bundle link instead of pasting multiple payloads into a ticket thread.
- **Demo walkthroughs** — Package the JSON state at each step of a demo flow so the audience can follow along or review later.
- **Handoff packages** — Deliver a set of reference payloads to a team (e.g. auth responses, error shapes, pagination examples) in one link.
- **Integration testing review** — Group the expected and actual payloads from a test failure so QA and developers see the same data.

For sharing a single payload, use [JSON Share Links](/tools/json-share-links/) instead — it is lighter weight for simple one-off shares. For comparing two related payloads to find differences, use the [JSON Diff Viewer](/tools/json-diff-viewer/). See [JSON in APIs](/learn/json-in-apis/) to understand how JSON flows through typical API workflows.
