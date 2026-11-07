---
'eslint-plugin-svelte': patch
---

Stop `svelte/prefer-svelte-reactivity` from reporting instances that are created inside a function and never leave it.
Keep reporting instances with customized methods or hooks that may expose the instance to external code.
