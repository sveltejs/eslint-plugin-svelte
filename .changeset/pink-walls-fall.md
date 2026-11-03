---
'eslint-plugin-svelte': patch
---

fix(require-event-prefix): ignore function props that return a value. This also changes two cases: `() => Promise<void>` is now ignored unless `checkAsyncFunctions` is enabled, and functions that return a Promise of a value (e.g. `Promise<string>`) are now ignored even when `checkAsyncFunctions` is enabled.
