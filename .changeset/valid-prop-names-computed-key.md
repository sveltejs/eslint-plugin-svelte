---
'eslint-plugin-svelte': patch
---

fix(valid-prop-names-in-kit-pages): resolve computed keys like `{ [k]: c } = $props()` to their static value instead of checking the identifier name
