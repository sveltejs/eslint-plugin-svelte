---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-svelte-reactivity'
description: 'disallow using built-in classes where a reactive alternative is provided by svelte/reactivity'
---

# svelte/prefer-svelte-reactivity

> disallow using built-in classes where a reactive alternative is provided by svelte/reactivity

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

The built-in `Date`, `Map`, `Set`, `URL` and `URLSearchParams` classes are often used in frontend code, however, their properties and methods are not reactive. Because of that, Svelte provides reactive versions of these 5 builtins as part of the "svelte/reactivity" package. This rule reports usage of the built-in versions in Svelte code.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-svelte-reactivity: "error" */

  import {
    SvelteDate,
    SvelteMap,
    SvelteSet,
    SvelteURL,
    SvelteURLSearchParams
  } from 'svelte/reactivity';

  /* ✓ GOOD */

  const a = new SvelteDate(8.64e15);
  const b = new SvelteMap([
    [1, 'one'],
    [2, 'two']
  ]);
  const c = new SvelteSet([1, 2, 1, 3, 3]);
  const d = new SvelteURL('https://svelte.dev/');
  const e = new SvelteURLSearchParams('foo=1&bar=2');

  /* ✗ BAD */

  const f = new Date(8.64e15);
  const g = new Map([
    [1, 'one'],
    [2, 'two']
  ]);
  const h = new Set([1, 2, 1, 3, 3]);
  const i = new URL('https://svelte.dev/');
  const j = new URLSearchParams('foo=1&bar=2');
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [svelte/reactivity documentation](https://svelte.dev/docs/svelte/svelte-reactivity)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-svelte-reactivity.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-svelte-reactivity.ts)
