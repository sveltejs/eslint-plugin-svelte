---
'eslint-plugin-svelte': patch
---

fix(no-useless-mustaches): treat `\0` as a useful escape so `ignoreStringEscape` keeps it and the autofix no longer turns it into `0`
