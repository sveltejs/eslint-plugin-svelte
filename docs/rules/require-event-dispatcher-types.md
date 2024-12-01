---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-event-dispatcher-types'
description: 'require type parameters for `createEventDispatcher`'
since: 'v2.16.0'
---

# svelte/require-event-dispatcher-types

> require type parameters for `createEventDispatcher`

## :book: Rule Details

This rule is aimed to enforce type parameters when calling `createEventDispatcher`. Adding types makes all `dispatch` calls as well as all event listeners typechecked. For more information, see the [svelte docs](https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#typing-component-events).

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/require-event-dispatcher-types: "error" */

  import { createEventDispatcher } from 'svelte';

  /* ✓ GOOD */
  const dispatch1 = createEventDispatcher<{ one: never; two: number }>();
  const dispatch2 = createEventDispatcher<Record<string, never>>();
  const dispatch3 = createEventDispatcher<any>();
  const dispatch4 = createEventDispatcher<unknown>();

  /* ✗ BAD */
  const dispatch5 = createEventDispatcher();
</script>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.16.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-event-dispatcher-types.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-event-dispatcher-types.ts)
