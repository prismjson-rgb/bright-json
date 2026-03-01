---
title: Objects and Arrays in Depth
level: comfortable
order: 6
keyTerms: []
---

Objects group related data; arrays hold lists. You can nest them: objects inside arrays, arrays inside objects. There's no limit to how deep you can go (though readability suffers after 3–4 levels).

```json
{
  "users": [
    {"id": 1, "name": "Alice", "roles": ["admin", "editor"]},
    {"id": 2, "name": "Bob", "roles": ["viewer"]}
  ],
  "metadata": {
    "total": 2,
    "page": 1
  }
}
```
