# Codebase review and migration findings

Review date: 15 September 2026. Scope: repository-wide deployment architecture, routing/content generation, dependencies, browser/server boundaries, storage, sharing, payment handling, and targeted correctness/security checks. This is a migration review with reproducible tests, not a claim of exhaustive security verification of every third-party UI component.

## Architecture assessment

| Area | Findings |
| --- | --- |
| `app/` | Static Next.js export. Content pages enumerate slugs at build time. No API routes, server actions, request-time filesystem access, or database-dependent rendering. Preserve nested URLs, sitemap, fragments, and real 404 responses. |
| `content/`, `scripts/` | Markdown becomes generated TypeScript before the build. The generator validates related content references. 56 tutorials, 25 tool pages, 3 informational pages. |
| `src/components/`, hooks | Browser workspace with lazy-loaded tool panels. Monaco loads separately. Formatting, validation, conversions, diff, flow view, and repair run locally. “AI Cleaner” uses local repair logic, not a hosted model. |
| `src/lib/`, browser worker | IndexedDB stores tabs/settings. Browser compression supports native deflate and legacy lz-string shares. cURL/URL requests go directly from the browser and remain subject to the target server's CORS policy. |
| `worker/` | Existing Cloudflare API stores optional short-link payloads in KV and creates Dodo checkout sessions. It is the only application server component. |
| Styling/UI | Tailwind, shadcn/Radix components, theme kit, and public assets work with a static build. No hosting-specific rewrite was needed. |
| Deployment/tooling | DigitalOcean spec existed, frontend Cloudflare configuration and CI did not. Worker tooling used Wrangler 3. README incorrectly described `.next` as the deployable export and recommended `next start`. |

## Findings addressed in this migration

### P1: Stored script injection in short-link HTML

The API accepted arbitrary payload text and placed it inside an inline script using only `JSON.stringify`. A stored `</script>` sequence could escape the script element. New payloads are restricted to supported encoding characters, and script literals escape `<`, including for existing KV records. HTML attributes are escaped separately. Tests cover legacy stored attacks and new invalid input.

The downloadable HTML exporter had a related gap: replacing the literal `</script>` missed HTML end tags containing whitespace. It now escapes every `<` in the embedded string, with regression tests.

### P1: Unbounded API body parsing and malformed requests

The API buffered `req.json()` before enforcing an actual body size limit; `Content-Length` could be absent. `null` bodies also caused a property access exception. Requests now use bounded streaming reads, byte-based payload limits, JSON media-type checks, and object validation. Corrupt KV records produce 404s; storage failures return controlled 503s.

### P1: No meaningful abuse control for writes or checkout creation

CORS alone does not stop non-browser callers. Added Cloudflare rate-limit bindings for short-link creation and checkout creation, with isolated namespaces per environment. Origin checks remain a browser API restriction, not authentication. New slugs have 96 random bits because KV cannot atomically enforce uniqueness with read-before-write.

### P1: Environment drift and production payment links in previews

Short URLs were hardcoded to `s.jsonprism.com` and donation controls linked to production in every build. Short URLs now use the request origin. Frontend deployment builds derive endpoints from the API config. Local development uses local KV and CORS; donations default to disabled locally. The production Worker name, KV namespace, and existing secret are preserved.

### P1: Payment errors and caching

Added required-configuration checks, a provider timeout, bounded response parsing, HTTPS URL validation, controlled upstream errors, and `Cache-Control: no-store`. HEAD checks do not create checkout sessions. Tests use a mocked payment provider and never charge money.

### P2: Share decoding trusted unchecked JSON shapes

Malformed decoded bundles or cURL metadata could crash React rendering. Decoders now validate the required shapes. The bundle viewer also handles JSON `null` and primitive documents without calling `Object.keys(null)`.

### P2: JSON transforms dropped `__proto__` keys

Sorting and some trimming/CSV transforms assigned user keys into ordinary objects. A `__proto__` property could be interpreted as a prototype setter instead of preserved data. These output dictionaries now have null prototypes, with preservation tests.

### P2: Legacy `/app/` navigation lost shared fragments

The redirect preserved queries but discarded `#json=...` and other share fragments. It now retains both.

### P2: Missing deployability and release checks

Added static asset routing, headers, local/production settings, generated Worker types, Node version guidance, lint configuration for ESLint 9, route/export verification, deployment smoke checks, and a GitHub Actions workflow. PRs validate without deployment; merges to main deploy automatically after checks pass. Fixed the static preview command and Next's ambiguous workspace-root detection. See the deployment runbook for account setup and rollback.

### P2: Dependency security debt

Removed unused `to-ico`, which pulled in obsolete request/image-processing dependencies. Updated packages within the supported major ranges, updated Wrangler to v4, and replaced manually installed Worker types with generated runtime definitions. Next's nested PostCSS is overridden to the patched project version. The isolated notes editor is migrated to patched Tiptap v3 with explicit React rendering options. Final audit/build results are recorded with the release validation.

### P2: Short-link privacy description was inaccurate

Compression is reversible and does not hide content from the storage operator or anyone with the link. Updated the short-link disclosure to explain the stored payload, retention, reversibility, and request metadata used for delivery/rate limiting.

## Follow-up fixes (15 September 2026)

All eight follow-up categories have implementation and regression coverage:

1. **Notes persistence:** rich-text document content lives on each tab in IndexedDB. Switching modes/tabs and reloading restores notes. JSON sharing deliberately excludes notes.
2. **Browser limits:** URL/cURL bodies are streamed with a 4 MB byte limit and 30-second deadline; native and legacy decompression have expansion limits. Legacy LZ decoding also caps dictionary allocations. Processing accepts up to 1 million characters, 64 nesting levels and 50,000 structural tokens; CSV adds a 100,000-cell budget. Imports reject files above 4 MB. These conservative limits intentionally reject extreme documents before recursive tools run.
3. **Privacy:** GTM and its noscript iframe are removed from the whole site. The privacy policy distinguishes local processing, opt-in short-link storage, direct URL/cURL requests, donations and Cloudflare delivery metadata.
4. **Storage failures:** tabs and notes display pending/saved/failure states, and unsaved changes trigger the browser's leave warning. Failed restoration prevents automatic overwriting of stored tabs. Settings failures show a toast; optional localStorage preferences cannot crash the workspace. IndexedDB opens time out and failed connections can retry. Saving during page exit is best effort; users should wait for the saved indicator or download their work.
5. **Exports:** XML declares xsi, normalizes root and child names, and rejects invalid characters/name collisions. CSV defaults to spreadsheet-safe text, handles carriage returns, and rejects flattened key collisions; the explicit opt-out supports trusted machine interchange.
6. **Schemas and numbers:** each schema validation runs in a new worker, cancelled on edits/unmount and terminated after 2 seconds. AJV instances are discarded after each request, with schema size limits and at most 100 reported errors. Draft 7 and 2020-12 are validated using their respective implementations. Format/minify/sort and import/unescape preserve numeric literals; tools requiring native numbers reject unsafe values with a visible explanation, retaining the original text for copying/download.
7. **Content:** tool counts derive from the content registry at build time. Stale named model rates are replaced by user-entered provider rates; the dated estimator disclosure explains the character heuristic, approximate costs and excluded discounts/taxes.
8. **Performance/accessibility:** standalone articles render Markdown/highlighting at build time and use ordinary example links. The production build reports 114 kB first-load JavaScript for learn articles. Article images use Next Image with explicit dimensions and lazy loading. Rail actions no longer nest interactive help controls, notes expose toolbar state and an editor label, schema sample loading is keyboard accessible, and Monaco no longer steals focus on mount and defaults to Tab moving focus.

Automated regression coverage includes notes round trips, storage failures, numeric/key preservation, bounded streams, legacy/native compressed shares, XML/CSV edge cases and worker cancellation/timeouts. This is targeted coverage, not a guarantee that every browser/plugin or arbitrarily expensive schema will succeed within the limits.

Follow-up validation: 169 tests pass; lint/typecheck and production build pass; 89 exported routes verify; dependency audit reports zero vulnerabilities; frontend Cloudflare dry run passes. Browser checks confirmed rich notes in two tabs after mode switches and reload, visible storage failure with an injected local fault, exact large-number formatting, Tab exiting Monaco, keyboard document-tab switching, zero nested rail controls/GTM scripts, normal schema validation, and termination of a pathological regex schema after two seconds.

## Validation boundaries

Original baseline: 116 tests passed and production static build succeeded. New regression tests cover API behavior, HTML escaping, share shape validation, special JSON keys, and canonical redirects. Local workerd/KV checks exercised a short-link round trip, invalid input, and missing-link handling. Browser checks exercised Monaco loading, JSON editing, formatting, and tree rendering. HTTP checks exercised nested content routes, query-preserving redirects, sitemap, and 404s.

Payment behavior is tested with mocks, not real transactions. Production traffic, existing links, and CI account settings must be verified separately during rollout. A local dry run validates configuration/bundling but does not prove remote permissions or DNS ownership.
