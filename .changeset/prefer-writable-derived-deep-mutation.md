---
'eslint-plugin-svelte': patch
---

Stop `svelte/prefer-writable-derived` from reporting a `$state` variable whose object may be mutated, since `$derived` is not deeply reactive. The rule now reports only when every use of the object is known to be safe. It also no longer reports destructured `$state` and async effects, whose rewrites were wrong.
