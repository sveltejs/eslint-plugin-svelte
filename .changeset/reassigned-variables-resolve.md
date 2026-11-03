---
'eslint-plugin-svelte': patch
---

no-navigation-without-resolve: follow every value assigned to a variable, so `let url = resolve('/'); url = '/foo'; goto(url);` is now reported, while `let url = resolve('/'); if (loggedIn) url = resolve('/dashboard'); goto(url);` is allowed.
