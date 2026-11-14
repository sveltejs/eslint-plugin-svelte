---
'eslint-plugin-svelte': patch
---

fix(prefer-destructured-store-props): report `$store.name` inside `{#each}` blocks and ignore `$store[index]` with a block-local index
