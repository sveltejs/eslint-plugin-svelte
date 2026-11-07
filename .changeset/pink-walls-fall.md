---
'eslint-plugin-svelte': patch
---

fix(require-event-prefix): ignore function props that return a value (e.g. `getHref: (item: T) => string`). This also changes two cases: `() => Promise<void>` is now ignored unless `checkAsyncFunctions` is enabled, and functions that return a Promise of a value (e.g. `Promise<string>`) are now ignored even when `checkAsyncFunctions` is enabled.

Only known no-value returns are checked; `any`, `unknown`, `never`, and unresolved generic returns are ignored. In generic components, only explicit no-value annotations and their Promise wrappers are checked to avoid false positives from parser substitutions.
