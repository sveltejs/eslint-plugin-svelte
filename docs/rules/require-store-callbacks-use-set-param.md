---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-store-callbacks-use-set-param'
description: 'store callbacks must use `set` param'
since: 'v2.12.0'
---

# svelte/require-store-callbacks-use-set-param

> store callbacks must use `set` param

## :book: Rule Details

This rule disallows if `readable` / `writable` store's setter function doesn't use `set` parameter.<br>
This rule doesn't check `derived` store. Therefore if you set a updated value asynchronously, please don't forget to use `set` function.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-store-callbacks-use-set-param: "error" */
  import { readable, writable, derived } from 'svelte/store';

  /** ✓ GOOD  */
  readable(null, (set) => {
    set(new Date());
    const interval = setInterval(() => set(new Date()), 1000);
    return () => clearInterval(interval);
  });

  // `set` is unused but this rule doesn't report.
  // For that, please use `no-unused-vars` rule.
  // refer: https://eslint.org/docs/latest/rules/no-unused-vars
  readable(false, (set) => true);

  writable(null, (set) => {
    set(1);
    return () => {
      /* no more subscribers */
    };
  });

  writable(false, (set) => true);

  derived(a, ($a) => $a * 2);
  derived(
    a,
    ($a, set) => {
      setTimeout(() => set($a), 1000);
    },
    'one moment...'
  );

  /** ✗ BAD  */
  readable(false, () => true);
  readable(false, (foo) => true);

  writable(false, () => true);
  writable(false, (foo) => true);
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > RUN TIME > svelte/store](https://svelte.dev/docs#run-time-svelte-store)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-store-callbacks-use-set-param.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-store-callbacks-use-set-param.ts)
