---
'eslint-plugin-svelte': patch
---

fix(prefer-destructured-store-props): ignore store property writes and bindings so suggestions do not replace them with read-only derived values or disconnect store updates
