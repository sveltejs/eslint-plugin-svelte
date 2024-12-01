---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-inspect'
description: 'Warns against the use of `$inspect` directive'
since: 'v2.45.0'
---

# svelte/no-inspect

> Warns against the use of `$inspect` directive

## :book: Rule Details

This rule reports usages of `$inspect`.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-inspect: "error" */
  // ✗ BAD
  $inspect(1);
</script>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.45.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-inspect.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-inspect.ts)
