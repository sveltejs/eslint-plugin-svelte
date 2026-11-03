---
'eslint-plugin-svelte': patch
---

fix(require-store-reactive-access): don't report callable stores used as functions, actions, transitions, or event handlers, and stores checked with `??` / `??=` with a store fallback. Don't auto-fix stores that are not declared at the top level, are used in the module script, or are on the left side of `||=` / `&&=` / `??=`.
