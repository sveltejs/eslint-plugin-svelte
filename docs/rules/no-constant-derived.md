---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-constant-derived'
description: 'disallow `$derived()` with an argument that never changes'
---

# svelte/no-constant-derived

> disallow `$derived()` with an argument that never changes

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

`$derived()` recomputes its value when the reactive values it reads change. When its argument reads no reactive values, the derived value is computed once and never updates, so `$derived()` only adds overhead and suggests a dependency that doesn't exist. Use `$state()` (or `$state.raw()`) for a value you reassign, and a plain variable for a value you don't.

A common case is passing a function to `$derived()`. This makes the derived value the function itself, which never changes. Use `$derived.by()` to derive the value the function returns.

This rule reports `$derived()` calls whose argument is built only from:

- literals, and template literals, arrays and objects built from them
- arrow functions and function expressions
- imported values
- `const` variables initialized with any of the above
- `undefined`, `NaN` and `Infinity`

Anything else may read a reactive value, so the rule does not report it. This includes function calls, `new`, property access, spread, the `in` operator, store subscriptions such as `$store`, `let` variables and function parameters.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-constant-derived: "error" */
  import { CONFIG, getTotal } from './config.js';

  let { post, first, last } = $props();
  let count = $state(0);
  const LIMIT = 10;

  /* ✓ GOOD */
  let doubled = $derived(count * 2);
  let fullName = $derived(`${first} ${last}`);
  let likes = $derived(post.likes);
  let total = $derived(getTotal());
  let quadrupled = $derived.by(() => count * 4);

  /* ✗ BAD */
  let initial = $derived(0);
  let items = $derived([]);
  let config = $derived(CONFIG);
  let limit = $derived(LIMIT * 2);
  let tripled = $derived(() => count * 3);
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > RUNES > $derived](https://svelte.dev/docs/svelte/$derived)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-constant-derived.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-constant-derived.ts)
