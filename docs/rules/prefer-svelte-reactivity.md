---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-svelte-reactivity'
description: 'disallow using mutable instances of built-in classes where a reactive alternative is provided by svelte/reactivity'
since: 'v3.11.0'
---

# svelte/prefer-svelte-reactivity

> disallow using mutable instances of built-in classes where a reactive alternative is provided by svelte/reactivity

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

The built-in `Date`, `Map`, `Set`, `URL` and `URLSearchParams` classes are often used in frontend code, however, their properties and methods are not reactive. Because of that, Svelte provides reactive versions of these 5 builtins as part of the "svelte/reactivity" package. This rule reports usage of mutable instances of the built-in versions in Svelte code.

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

  const a = new Date(8.64e15);
  const b = new Map([
    [1, 'one'],
    [2, 'two']
  ]);
  const c = new Set([1, 2, 1, 3, 3]);
  const d = new URL('https://svelte.dev/');
  const e = new URLSearchParams('foo=1&bar=2');

  // These don't modify the instances
  a.getTime();
  b.keys();
  c.has(1);
  d.port;
  e.entries();

  const f = new SvelteDate(8.64e15);
  const g = new SvelteMap([
    [1, 'one'],
    [2, 'two']
  ]);
  const h = new SvelteSet([1, 2, 1, 3, 3]);
  const i = new SvelteURL('https://svelte.dev/');
  const j = new SvelteURLSearchParams('foo=1&bar=2');

  // These modify the instances
  f.getTime();
  g.keys();
  h.has(1);
  i.port;
  j.entries();

  /* ✗ BAD */

  const k = new Date(8.64e15);
  const l = new Map([
    [1, 'one'],
    [2, 'two']
  ]);
  const m = new Set([1, 2, 1, 3, 3]);
  const n = new URL('https://svelte.dev/');
  const o = new URLSearchParams('foo=1&bar=2');

  // These modify the instances
  k.setMonth(3);
  l.clear();
  m.delete(2);
  n.port = 80;
  o.sort();
</script>
```

```js
// In svelte.js files, exported variables are also reported
/* eslint svelte/prefer-svelte-reactivity: "error" */

/* ✗ BAD */

const a = new Date(8.64e15);
const b = new Map([
  [1, 'one'],
  [2, 'two']
]);
const c = new Set([1, 2, 1, 3, 3]);
const d = new URL('https://svelte.dev/');
const e = new URLSearchParams('foo=1&bar=2');

export { a, b, c, d as dd };
export default e;
```

## :wrench: Options

```json
{
  "svelte/prefer-svelte-reactivity": [
    "error",
    {
      "ignoreLocalVariables": true
    }
  ]
}
```

- `ignoreLocalVariables` ... Set to `true` to ignore variables declared anywhere other than the top level, such as inside functions. The default is `true`. In almost all cases, we do not need to set this to `false`.

## :books: Further Reading

- [svelte/reactivity documentation](https://svelte.dev/docs/svelte/svelte-reactivity)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.11.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-svelte-reactivity.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-svelte-reactivity.ts)
