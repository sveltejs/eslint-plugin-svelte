---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/require-stores-init"
description: "require initial value in store"
---

# svelte/require-stores-init

> require initial value in store

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule is aimed to enforce initial values when initializing the Svelte stores.

<ESLintCodeBlock language="javascript">

<!--eslint-skip-->

```js
/* eslint svelte/require-stores-init: "error" */

import { writable, readable, derived } from "svelte/store"

/* ✓ GOOD */
export const w1 = writable(false)
export const r1 = readable({})
export const d1 = derived([a, b], () => {}, false)

/* ✗ BAD */
export const w2 = writable()
export const r2 = readable()
export const d2 = derived([a, b], () => {})
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/require-stores-init.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/require-stores-init.ts)
