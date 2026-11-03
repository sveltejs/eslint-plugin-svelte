---
'eslint-plugin-svelte': patch
---

no-navigation-without-resolve: only follow variables that are `const` or never reassigned, so `let url = resolve('/'); url = '/foo'; goto(url);` is reported.
