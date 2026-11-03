---
'eslint-plugin-svelte': patch
---

fix(valid-compile): read the parser from `context.languageOptions.parserOptions`, since `context.parserOptions` was removed in ESLint v10
