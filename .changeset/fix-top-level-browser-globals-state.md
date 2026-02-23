---
"eslint-plugin-svelte": patch
---

fix(no-top-level-browser-globals): false positive when browser globals appear inside TypeScript generic type parameters (e.g. `$state<HTMLElement>(...)`).
