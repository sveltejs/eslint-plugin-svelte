---
'eslint-plugin-svelte': patch
---

fix(valid-compile): keep `svelte-ignore` comments as comments when compiling, so a block that only holds one is not reported as empty
