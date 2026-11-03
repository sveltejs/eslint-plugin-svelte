---
'eslint-plugin-svelte': patch
---

Stop `svelte/no-unused-svelte-ignore` from reporting `svelte-ignore` comments for runtime warnings (e.g. `ownership_invalid_binding`), which the compiler can't report.
