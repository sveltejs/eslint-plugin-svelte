---
'eslint-plugin-svelte': patch
---

Pass `compilerOptions.runes` from the Svelte config to the compiler in `svelte/valid-compile` and `svelte/no-unused-svelte-ignore`, so runes-mode warnings are reported for files that rely on `runes: true`. The function form (`runes: ({ filename }) => ...`) is also supported.
