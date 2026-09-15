# Cloudflare production deployment

## Topology

| Purpose | Worker | Domain |
| --- | --- | --- |
| Static frontend | `json-prism` | `jsonprism.com` |
| Canonical redirect | `json-prism-www` | `www.jsonprism.com` |
| Short links and donations | `prism-short` | `s.jsonprism.com` |

Account: `8294e44ced7d8f156440f89cc13b1bd4` (`prismjson@gmail.com`). Production KV: `4c864c997c894ae8bbf2547253fb0d47` (`shortner`). These IDs are not secrets. There is no staging environment. Local development uses local KV, localhost CORS, and disabled donations.

The frontend uses Next.js static export. Cloudflare serves `out/` with trailing-slash normalization and real 404 responses. It needs no Next.js server. See [static routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/).

## CI/CD

- Pull requests run clean installs, dependency audits, lint, TypeScript, 155 unit tests, Worker type generation, a production build, export checks, and three Wrangler dry runs. They receive no deployment secret.
- Merging into `main` reruns validation on the merged revision and automatically deploys the API, frontend, and canonical redirect. The frontend is the exact artifact from validation.
- Live checks cover key pages, sitemap, 404s, API health, the www redirect, and `/deployment.json` matching the GitHub commit SHA.
- Runs for a branch are serialized. Failed validation prevents deployment. A manual run on `main` can redeploy it.

GitHub's `Production` environment is restricted to `main`, with no manual reviewer gate. Its `CLOUDFLARE_API_TOKEN` is an account-owned token named `json-prism-github-actions`. Scope: Workers Scripts Write, Workers KV Storage Write, and Account Settings Read in this account; Workers Routes Write and Zone Read only for `jsonprism.com`. It expires on **16 September 2027**; rotate it before expiry. Never use Wrangler's personal OAuth refresh token in CI.

Protect `main` with required PRs and the `validate` check, up-to-date branches, and conversation resolution. Do not enable a second Cloudflare Builds pipeline against these Workers while GitHub Actions owns deployments.

## Local validation and manual recovery deployment

Use Node.js 22. `NEXT_PUBLIC_*` values are public build-time configuration; never put secrets there. Production builds derive URLs from `worker/wrangler.jsonc`.

```sh
npm ci
npm ci --prefix worker
npm run check
npm run typecheck --prefix worker
npm run build:production
npm run verify:export
npm run deploy:check
npm run deploy:check --prefix worker
npx wrangler deploy --config redirect/wrangler.jsonc --env production --dry-run
```

Normal releases use PRs. For recovery, verify `npx wrangler whoami` shows the correct account, then:

```sh
npm run deploy:production --prefix worker
npx wrangler deploy --env production
npx wrangler deploy --config redirect/wrangler.jsonc --env production
node scripts/verify-deployment.mjs
```

Manually verify formatting, notes, sharing, conversion, and an existing short link. Smoke tests never create live checkout sessions.

## API secrets and storage

`DODO_API_KEY` was confirmed present before migration. Redeploying `prism-short` preserves it. Check secret names from `worker/` with `npx wrangler secret list --env production`. Rotate interactively with `npx wrangler secret put DODO_API_KEY --env production`. Never pass values as CLI arguments or public frontend configuration.

The API retains the existing `{ k, p }` record format and 30-day expiration. Legacy slugs work; new slugs use 96 random bits. KV is eventually consistent, so a new link may briefly miss in another location.

Short-link writes are limited to 10/minute and checkout creation to 5/minute per client IP and Cloudflare location. This is abuse reduction, not authentication or a precise global quota. See [rate-limit locality](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). Application code does not log payloads or IPs; Worker observability is disabled. Responses use `no-store`, and HEAD requests do not create checkout sessions.

## Monitoring and rollback

`GET /health` is a liveness check, not a KV/payment-provider probe. Review Cloudflare error metrics after release without logging user payloads. Worker deployments are separate: a later deployment failure does not automatically roll back an earlier API deployment. Keep API changes backward-compatible and use the workflow logs to identify the last successful component.

List versions with `npx wrangler deployments list --env production`, then restore with `npx wrangler rollback <version-id> --env production`. Run from root for the frontend or `worker/` for the API. Rollback does not restore KV contents or DNS. A reverted PR provides a normal validated recovery release.

### Pre-migration records, 15 September 2026

Observed in the authenticated DNS dashboard:

| Host | Type | Previous target | Proxy | TTL |
| --- | --- | --- | --- | --- |
| `jsonprism.com` | A | `172.66.0.96` | Proxied | Auto |
| `jsonprism.com` | A | `162.159.140.98` | Proxied | Auto |
| `www.jsonprism.com` | CNAME | `prismjson-bwx9s.ondigitalocean.app` | DNS only | Auto |

Previous API version: `3a3f107d-d2a5-4e46-8e8e-f052ba52cbdb`. Keep the existing DigitalOcean deployment and `.do/app.yaml` through the rollback window. For host rollback, detach the new frontend/redirect custom domains and restore the records above. Preserve all MX, TXT, email routing, and verification records.
