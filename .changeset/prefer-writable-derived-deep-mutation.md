---
'eslint-plugin-svelte': patch
---

Stop `svelte/prefer-writable-derived` from reporting a `$state` variable that is mutated through its properties (including through `{#each}` items, aliases and `bind:` on components), since `$derived` is not deeply reactive.
