---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-ignored-unsubscribe'
description: 'disallow ignoring the unsubscribe method returned by the `subscribe()` on Svelte stores.'
since: 'v2.34.0'
---

# svelte/no-ignored-unsubscribe

> disallow ignoring the unsubscribe method returned by the `subscribe()` on Svelte stores.

## :book: Rule Details

This rule fails if an "unsubscriber" returned by call to `subscribe()` is neither assigned to a variable or property or passed to a function.

One should always unsubscribe from a store when it is no longer needed. Otherwise, the subscription will remain active and constitute a **memory leak**.
This rule helps to find such cases by ensuring that the unsubscriber (the return value from the store's `subscribe` method) is not ignored.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-ignored-unsubscribe: "error" */

  import myStore from './my-stores';

  /* ✓ GOOD */
  const unsubscribe = myStore.subscribe(() => {});

  /* ✗ BAD */
  myStore.subscribe(() => {});
</script>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.34.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-ignored-unsubscribe.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-ignored-unsubscribe.ts)
