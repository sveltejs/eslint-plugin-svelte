---
'eslint-plugin-svelte': minor
---

Added restrict-mustache-expressions rule to prevent surface area for bugs where non-stringifiable objects or arrays get turned into `[object Object]` which is almost never wanted behavior
