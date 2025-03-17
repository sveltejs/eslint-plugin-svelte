---
'eslint-plugin-svelte': minor
---

feat: add `ignorePropertyPatterns` property and rename `ignorePatterns` to `ignoreTypePatterns` in `no-unused-props` rule. The `ignorePatterns` option existed only for a few days and is removed by this PR. Technically, this is a breaking change, but we’ll handle it as a minor release since very few users are likely affected.
