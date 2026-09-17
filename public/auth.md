# JSON Prism auth.md

## Agent audience

This document is for agents discovering JSON Prism's public documentation and
optional short-link service. The JSON tools execute in the user's browser; there
is no hosted JSON processing API.

## Registration and supported methods

Access is anonymous. No account registration, provisioning endpoint, API key,
OAuth authorization server, token endpoint, or credential claim flow is supported.
Do not POST to `/agent/auth`: that endpoint does not exist.

## Credential use

No credentials are issued or required. Do not send Authorization headers, bearer
tokens, passwords, or cookies. Public pages and `GET https://s.jsonprism.com/health`
can be read without authentication.

The browser-oriented `POST https://s.jsonprism.com/s` endpoint requires
`Origin: https://jsonprism.com` and `Content-Type: application/json`. The Origin
check is an abuse control, not authentication or an agent identity mechanism.
Creation is rate limited to 10 requests per minute per IP at the service edge.
Creating a link stores the supplied payload for 30 days and should only happen
when the user requests sharing. Anyone with the link can open it.

The donation checkout route creates a checkout session and is not a registration
method. Passive discovery must not call it or create short links.

See [API documentation](/api.md), [OpenAPI](/openapi.json), and
[API catalog](/.well-known/api-catalog).
