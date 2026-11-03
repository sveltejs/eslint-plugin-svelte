---
'eslint-plugin-svelte': patch
---

Honor `svelte-ignore` comments on nested script nodes in `svelte/no-unused-svelte-ignore` and `svelte/valid-compile` (Svelte 5), and no longer treat a comment at the end of the previous line as an ignore comment for the next node.
