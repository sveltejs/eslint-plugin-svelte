---
'eslint-plugin-svelte': patch
---

Fix a crash in the `svelte/no-reactive-functions` suggestion on ESLint 10, which removed `SourceCode#isSpaceBetweenTokens`.
