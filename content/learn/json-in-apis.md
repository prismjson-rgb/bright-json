---
title: JSON in REST APIs
level: practical
order: 9
metaTitle: "How JSON is Used in REST APIs — Complete Guide"
metaDescription: "Learn how JSON powers REST APIs. Request and response examples, Content-Type headers, and parsing in JavaScript, Python, and more."
keyTerms: []
---

REST APIs send and receive JSON. The client sends JSON in the request body (e.g., POST), and the server responds with JSON. Always set `Content-Type: application/json`.

- GET returns JSON in the body
- POST/PUT/PATCH send JSON in the body
- Content-Type: application/json header
- Status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found

```json
{
  "data": [
    {"id": 1, "title": "First Post"},
    {"id": 2, "title": "Second Post"}
  ],
  "meta": {
    "page": 1,
    "total": 42
  }
}
```
