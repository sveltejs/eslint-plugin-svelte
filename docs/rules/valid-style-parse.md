---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-style-parse'
description: 'require valid style element parsing'
since: 'v3.0.0'
---

# svelte/valid-style-parse

> require valid style element parsing

## :book: Rule Details

This rule reports issues with parsing of the `<style>` element by the svelte-eslint-parser.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-style-parse: ["error"] */
</script>

<!-- ✓ GOOD -->
<style>
  .class {
    font-weight: bold;
  }
</style>
```

```svelte
<script>
  /* eslint svelte/valid-style-parse: ["error"] */
</script>

<!-- ✓ GOOD -->
<style lang="scss">
  .class {
    font-weight: bold;
  }
</style>
```

```svelte
<script>
  /* eslint svelte/valid-style-parse: ["error"] */
</script>

<!-- ✗ BAD -->
<style>
  .class
    font-weight: bold;
</style>
```

```svelte
<script>
  /* eslint svelte/valid-style-parse: ["error"] */
</script>

<!-- ✗ BAD -->
<style lang="unknown">
  .class {
    font-weight: bold;
  }
</style>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.0.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/valid-style-parse.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/valid-style-parse.ts)
