# JSON Prism service API

Base URL: https://s.jsonprism.com

JSON formatting, validation, conversion and editing run locally in the browser.
The service API provides optional short links and a browser donation checkout.
No accounts, API keys or OAuth are supported. See [auth.md](/auth.md).

## Create a short link

`POST /s` with `Content-Type: application/json` and `Origin: https://jsonprism.com`.
The JSON body contains `kind` (`json`, `bundle`, `curl` or `curlcmd`) and a nonempty
`payload` string encoded by the matching JSON Prism sharing workflow. Payloads
must match `^[A-Za-z0-9~+\-_$=/]+$` and be at most 200,000 UTF-8 bytes. This is not
an endpoint for uploading raw JSON; the total body limit is 201,024 bytes.

Success is HTTP 201 with `slug`, `url`, and `expiresInSeconds` (2592000).
Links expire after 30 days. Anyone who has the link can open its contents.
Only create a link when sharing is explicitly requested. There is no deletion API.

Errors: 400 for invalid JSON/body/kind/payload; 403 for a missing or mismatched
Origin; 413 for an oversized payload/body; 415 for the wrong media type;
429 for rate limiting; 503 for storage failure or exhausted slug attempts.
The creation limit is 10 requests per minute per IP at the service edge.
HTTP 429 includes `Retry-After: 60`. Responses use `Cache-Control: no-store`.

## Open an existing short link

`GET /{slug}` returns an HTML page (HTTP 200) that redirects in the browser to
JSON Prism with the encoded payload in the URL fragment. It is not an HTTP 3xx
redirect or a JSON response. Missing or expired links return 404.
`HEAD /{slug}` returns the corresponding status and headers without a body.

## Health

`GET /health` returns HTTP 200 and `{"ok":true}`. This is a liveness check,
not a check of storage or payment provider availability. HEAD is also supported.

## Donation checkout

`GET /donate` creates a payment-provider checkout session and redirects with HTTP
302. It must only be opened for a user-requested donation, never during passive
discovery. Errors are 429 (rate limit), 502 (provider failure) or 503 (not configured).
`HEAD /donate` returns HTTP 200 without creating a checkout session.

## Discovery and content

[OpenAPI description](/openapi.json) · [API catalog](/.well-known/api-catalog).
Public editorial pages support `Accept: text/markdown`; browsers receive HTML
by default. Content usage preferences are declared in [robots.txt](/robots.txt).
