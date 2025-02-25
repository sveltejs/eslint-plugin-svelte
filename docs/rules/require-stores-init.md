---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-stores-init'
description: 'require initial value in store'
since: 'v2.5.0'
---

# svelte/require-stores-init

> require initial value in store

## :book: Rule Details

This rule is aimed to enforce initial values when initializing the Svelte stores.

<!--eslint-skip-->

```js
/* eslint svelte/require-stores-init: "error" */

import { writable, readable, derived } from 'svelte/store';

/* ✓ GOOD */
export const w1 = writable(false);
export const r1 = readable({});
export const d1 = derived([a, b], () => {}, false);

/* ✗ BAD */
export const w2 = writable();
export const r2 = readable();
export const d2 = derived([a, b], () => {});
```

## :wrench: Options

Nothing.

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/stores-initial-value` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-stores-init.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-stores-init.ts)
