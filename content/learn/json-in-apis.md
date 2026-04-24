---
title: JSON in REST APIs
level: practical
order: 9
metaTitle: "How JSON is Used in REST APIs — Complete Guide"
metaDescription: "Learn how JSON powers REST APIs. Request and response examples, Content-Type headers, and parsing in JavaScript, Python, and more."
keyTerms: []
publishedAt: "2025-12-09"
---

JSON is the lingua franca of REST APIs. When a client and server communicate over HTTP, JSON is almost always the format for both request bodies and response bodies. Understanding how JSON flows through an API makes you a more effective developer — whether you are building an API or consuming one.

## How JSON flows through a REST API

- `GET /users` — server responds with a JSON body (no request body sent)
- `POST /users` — client sends a JSON body; server responds with JSON
- `PUT /users/1` — client sends a full replacement JSON body
- `PATCH /users/1` — client sends a partial JSON body with only changed fields
- `DELETE /users/1` — usually no body; server may return a JSON confirmation

## The Content-Type header

Always set `Content-Type: application/json` when sending JSON in a request body. Without it, many servers will reject or mishandle the data.

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "editor"
}
```

The corresponding HTTP request header looks like:

```
POST /api/users HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGci...
```

## Typical API response structure

Most production APIs wrap their JSON in an envelope object:

```json
{
  "data": [
    {"id": 1, "title": "First Post", "author": "Alice"},
    {"id": 2, "title": "Second Post", "author": "Bob"}
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 42
  }
}
```

The envelope pattern lets you add metadata (pagination, version, request ID) without changing the shape of `data`.

## Error responses

Good APIs return JSON for errors too, not just success:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The email field is required.",
    "fields": {
      "email": ["This field is required."]
    }
  }
}
```

Common HTTP status codes to know:
- `200 OK` — success
- `201 Created` — resource created
- `204 No Content` — success, no body (common for DELETE)
- `400 Bad Request` — invalid JSON or missing fields
- `401 Unauthorized` — missing or invalid credentials
- `404 Not Found` — resource does not exist
- `422 Unprocessable Entity` — valid JSON, but data fails validation
- `500 Internal Server Error` — server-side problem

## Fetching JSON in JavaScript

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}
```

```javascript
const response = await fetch("https://api.example.com/users/1", {
  headers: { "Accept": "application/json" }
});

if (!response.ok) {
  throw new Error(`HTTP error ${response.status}`);
}

const user = await response.json(); // parses JSON automatically
console.log(user.name); // "Alice"
```

## Sending JSON in a POST request

```javascript
const newUser = { name: "Carol", email: "carol@example.com" };

const response = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newUser)
});

const created = await response.json();
console.log(created.id); // e.g., 42
```

## JSON in GraphQL

GraphQL also uses JSON — both the query response and the error format are JSON. The shape differs from REST but the format is the same:

```json
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice"
    }
  }
}
```

## Try it in JSON Prism

Paste an API response into the [JSON Formatter](/tools/json-formatter/) to explore its structure. Need to share a sample API payload with a colleague? Use [JSON Share Links](/tools/json-share-links/) to generate a permanent URL with the JSON pre-loaded in the viewer.
