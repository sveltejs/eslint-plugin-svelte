---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-store-update-return'
description: 'require store `update` callbacks to return a value'
---

# svelte/require-store-update-return

> require store `update` callbacks to return a value

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports callbacks passed to the `update` method of a store that do not return a value.

`store.update(callback)` sets the store to the value returned by `callback`. If the callback has no `return` statement, or has a code path that ends without returning a value, the store is set to `undefined`. This often happens when the callback mutates the current value instead of returning it.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-store-update-return: "error" */
  import { writable } from 'svelte/store';

  const count = writable(0);
  const items = writable([]);

  /* ✓ GOOD */
  count.update((n) => n + 1);

  items.update(($items) => {
    $items.push('new item');
    return $items;
  });

  count.update((n) => {
    if (n > 10) {
      return 0;
    }
    return n + 1;
  });

  /* ✗ BAD */
  items.update(($items) => {
    $items.push('new item');
  });

  count.update((n) => {
    if (n > 10) {
      return 0;
    }
  });

  count.update((n) => {
    if (n > 10) {
      return;
    }
    return n + 1;
  });
</script>
```

The rule checks `update` calls on stores created with `writable` from `svelte/store` and on the `update` function destructured from a `writable` store, which is common in custom stores:

<!--eslint-skip-->

```js
/* eslint svelte/require-store-update-return: "error" */
import { writable } from 'svelte/store';

export function createCount() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    /* ✓ GOOD */
    increment: () => update((n) => n + 1),
    /* ✗ BAD */
    decrement: () =>
      update((n) => {
        n - 1;
      }),
    reset: () => set(0)
  };
}
```

When type information is available, `update` calls on any value with a store type, such as a `Writable` prop or a store imported from another module, are checked as well.

Only function expressions and arrow functions written directly as the argument of `update` are checked. Async functions and generator functions are not checked.

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > svelte/store > writable](https://svelte.dev/docs/svelte/svelte-store#writable)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-store-update-return.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-store-update-return.ts)
