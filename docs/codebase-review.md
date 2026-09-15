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

## Remaining product work

These are independent of the hosting migration and need focused follow-up:

1. **Notes are not persisted (P1).** `JsonNoteEditorInner.tsx` initializes empty editor content without IndexedDB loading/saving. Switching away can discard notes, although the privacy page describes notes as stored. Add tested persistence or clearly label notes as temporary.
2. **Bound browser resource use (P2).** URL/cURL fetch helpers read full responses before enforcing their size check. Native decompression has no expanded-size cap; legacy decompression and several recursive tools can exhaust browser memory/stack on hostile inputs. Add streaming caps, depth budgets, and cancellation. The graph and diff helpers already have partial size limits.
3. **Analytics/privacy consistency (P2).** `app/layout.tsx` loads GTM on workspace pages. A third-party script can access the document and fragment. The remote container configuration was not audited; “no tracking” and unconditional “nothing uploaded” copy is too broad. Review the container and make analytics/configuration/disclosure deliberate.
4. **Storage failure UX (P2).** Several save operations swallow IndexedDB errors; theme/donation helpers access localStorage without guards. Blocked or full storage can cause failures or silent loss. Surface save status and test unavailable-storage behavior.
5. **Transformation edge cases (P2).** XML export emits `xsi:nil` without declaring its namespace and accepts root/tag names that can be invalid XML. CSV does not mitigate formula execution when opened in spreadsheet apps. Validate XML output and offer a documented spreadsheet-safe CSV option.
6. **Schema and numerical precision (P2).** AJV compilation is synchronous and cached; large/adversarial schemas can stall the main thread. Native `JSON.parse`/`JSON.stringify` also round integers outside JavaScript's safe range. Establish explicit limits and a precision-preserving mode where required.
7. **Content consistency (P3).** Homepage titles and copy say 19 tools while content generation returns 25 tool pages. Token/model prices are hardcoded and undated. Replace fixed counts and clearly label/maintain estimates.
8. **Performance/accessibility follow-up (P3).** Learn article routes ship substantial client JavaScript; article images still trigger the existing Next image lint warning. Nested help buttons and editor keyboard flows deserve dedicated accessibility testing.

## Validation boundaries

Original baseline: 116 tests passed and production static build succeeded. New regression tests cover API behavior, HTML escaping, share shape validation, special JSON keys, and canonical redirects. Local workerd/KV checks exercised a short-link round trip, invalid input, and missing-link handling. Browser checks exercised Monaco loading, JSON editing, formatting, and tree rendering. HTTP checks exercised nested content routes, query-preserving redirects, sitemap, and 404s.

Payment behavior is tested with mocks, not real transactions. Production traffic, existing links, and CI account settings must be verified separately during rollout. A local dry run validates configuration/bundling but does not prove remote permissions or DNS ownership.
