---
'eslint-plugin-svelte': patch
---

Fix false positives in `svelte/no-unused-props` when the props object is destructured (e.g. `const { a } = props`), and for private fields of generic class instances.
