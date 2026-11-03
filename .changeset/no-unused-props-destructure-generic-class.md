---
'eslint-plugin-svelte': patch
---

Fix false positives in `svelte/no-unused-props`:

- The props object is destructured (e.g. `const { a } = props`). Destructured keys now count as used, so nested destructuring (e.g. `const { name } = user`) can now report unused nested properties, the same as `user.name`.
- The props object is used as a whole (e.g. `$inspect(props)` or `fn(props)`). Every property now counts as used.
- Private fields like `#foo` of class instances, including generic classes and intersections.
