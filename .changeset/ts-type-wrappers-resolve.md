---
'eslint-plugin-svelte': patch
---

no-navigation-without-resolve: look through TypeScript `as`, `satisfies`, `!` and `<T>` wrappers, so e.g. `goto('', { shallow: true } as const)` and `const paths = [resolve('/')] as const` are no longer reported.
