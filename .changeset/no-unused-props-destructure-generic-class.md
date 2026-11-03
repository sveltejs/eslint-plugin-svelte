---
'eslint-plugin-svelte': patch
---

Fix false positives in `svelte/no-unused-props`:

- The props object is destructured (e.g. `const { a } = props`). A destructured key now counts as used when its binding is used, and an unused one is reported. Nested destructuring (e.g. `const { name } = user`) can now report unused nested properties, the same as `user.name`.
- The props object is used as a whole (e.g. `$inspect(props)` or `fn(props)`). Every property now counts as used. A type query like `typeof props.a` is not counted as a use.
- A dynamic key like `user[key]` now counts as using every property of `user`.
- Numeric and template literal keys like `props[0].a` and ``props[`a`]``, and wrapped values like `props!.a`, `(props as Props).a` and `(props satisfies Props).a` are now tracked.
- Instances of generic classes are now skipped like other class instances.
- With `allowUnusedNestedProperties`, nested properties are never reported.
- Class members that cannot be read from outside (`#foo`, `private`, `protected`) are no longer reported, e.g. in intersections.
