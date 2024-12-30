---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-store-async'
description: 'disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features'
since: 'v2.7.0'
---

# svelte/no-store-async

> disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features

## :book: Rule Details

This rule reports all uses of async/await inside svelte stores.
Because it causes issues with the auto-unsubscribing features.

<!--eslint-skip-->

```js
/* eslint svelte/no-store-async: "error" */

import { writable, readable, derived } from 'svelte/store';

/* ✓ GOOD */
const w1 = writable(false, () => {});
const r1 = readable(false, () => {});
const d1 = derived(a1, ($a1) => {});

/* ✗ BAD */
const w2 = writable(false, async () => {});
const r2 = readable(false, async () => {});
const d2 = derived(a1, async ($a1) => {});
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > 4. Prefix stores with $ to access their values / Store contract](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.7.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-store-async.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-store-async.ts)
