---
'eslint-plugin-svelte': patch
---

Stop `svelte/prefer-writable-derived` from reporting a `$state` variable that is mutated through its properties, since `$derived` is not deeply reactive.
