---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/derived-has-same-inputs-outputs'
description: 'derived store should use same variable names between values and callback'
since: 'v2.8.0'
---

# svelte/derived-has-same-inputs-outputs

> derived store should use same variable names between values and callback

## 📖 Rule Details

This rule reports where variable names and callback function's argument names are different.
This is mainly a recommended rule to avoid implementation confusion.

<ESLintCodeBlock language="javascript">

<!--eslint-skip-->

```js
/* eslint svelte/derived-has-same-inputs-outputs: "error" */

import { derived } from 'svelte/store';

/* ✓ GOOD */
derived(a, ($a) => {});
derived(a, ($a, set) => {});
derived([a, b], ([$a, $b]) => {});

/* ✗ BAD */
derived(a, (b) => {});
derived(a, (b, set) => {});
derived([a, b], ([one, two]) => {});
```

</ESLintCodeBlock>

## 🔧 Options

Nothing.

## 📚 Further Reading

- [Svelte - Docs > RUN TIME > svelte/store > derived](https://svelte.dev/docs#run-time-svelte-store-derived)

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v2.8.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/derived-has-same-inputs-outputs.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/derived-has-same-inputs-outputs.ts)
