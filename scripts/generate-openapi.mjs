import { writeFileSync } from "node:fs";

const response = (description, schema, type = "application/json") => ({ description, ...(schema ? { content: { [type]: { schema } } } : {}) });
const string = { type: "string" };
const error = { type: "object", properties: { error: string, limit: { type: "integer" } }, required: ["error"] };
const slug = { name: "slug", in: "path", required: true, schema: { type: "string", pattern: "^[A-Za-z0-9]{1,24}$" } };
const spec = {
  openapi: "3.1.0",
  info: { title: "JSON Prism service API", version: "1.0.0", description: "Optional anonymous sharing and browser donation checkout. JSON tools run in the browser; there is no hosted JSON processing API." },
  servers: [{ url: "https://s.jsonprism.com" }],
  externalDocs: { url: "https://jsonprism.com/api.md" },
  security: [],
  paths: {
    "/s": {
      post: {
        operationId: "createShortLink", summary: "Store a shared payload for 30 days",
        description: "Only invoke for user-requested sharing. Payload must use the matching JSON Prism sharing encoding, not raw JSON. Anyone with the returned URL can access it. Maximum payload: 200000 UTF-8 bytes; maximum request body: 201024 bytes. Rate limit: 10 requests per minute per IP at the service edge. Origin is an abuse check, not authentication.",
        parameters: [{ name: "Origin", in: "header", required: true, schema: { type: "string", const: "https://jsonprism.com" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["kind", "payload"], properties: {
          kind: { type: "string", enum: ["json", "bundle", "curl", "curlcmd"] },
          payload: { type: "string", minLength: 1, maxLength: 200000, pattern: "^[A-Za-z0-9~+\\-_$=/]+$" },
        } } } } },
        responses: {
          "201": response("Created", { type: "object", required: ["slug", "url", "expiresInSeconds"], properties: { slug: string, url: { type: "string", format: "uri" }, expiresInSeconds: { type: "integer", const: 2592000 } } }),
          ...Object.fromEntries([[400, "Invalid JSON, body, kind or payload"], [403, "Origin missing or mismatched"], [413, "Body or payload too large"], [415, "Unsupported media type"], [503, "Storage unavailable or slug attempts exhausted"]].map(([code, message]) => [code, response(message, error)])),
          "429": { ...response("Rate limited", error), headers: { "Retry-After": { schema: { type: "string", const: "60" } } } },
        },
      },
    },
    "/{slug}": {
      parameters: [slug],
      get: { operationId: "openShortLink", summary: "Return an HTML browser redirect to the shared document", responses: { "200": response("HTML with script and meta refresh redirect, not an HTTP redirect", string, "text/html"), "404": response("Expired or missing link", string, "text/html"), "503": response("Service unavailable", error) } },
      head: { operationId: "checkShortLink", responses: { "200": response("Link exists; no body"), "404": response("Expired or missing link"), "503": response("Service unavailable") } },
    },
    "/health": {
      get: { operationId: "getHealth", summary: "Liveness only; does not check dependencies", responses: { "200": response("Alive", { type: "object", required: ["ok"], properties: { ok: { type: "boolean", const: true } } }) } },
      head: { operationId: "checkHealth", responses: { "200": response("Alive; no body") } },
    },
    "/donate": {
      get: { operationId: "createDonationCheckout", summary: "Create a donation checkout session", description: "Has side effects. Only invoke for a user-requested donation. Never call during passive discovery.", responses: {
        "302": { description: "Redirect to payment provider", headers: { Location: { schema: { type: "string", format: "uri" } } } },
        "429": response("Rate limited"), "502": response("Payment provider failure"), "503": response("Not configured"),
      } },
      head: { operationId: "checkDonationRoute", description: "Does not create a checkout or check provider configuration.", responses: { "200": response("Route exists; no body") } },
    },
  },
};
writeFileSync(new URL("../public/openapi.json", import.meta.url), JSON.stringify(spec, null, 2) + "\n");
