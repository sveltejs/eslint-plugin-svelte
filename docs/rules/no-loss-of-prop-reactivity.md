---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-loss-of-prop-reactivity"
description: "disallow the use of props that potentially lose reactivity"
---

# svelte/no-loss-of-prop-reactivity

> disallow the use of props that potentially lose reactivity

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports the use of props that potentially lose reactivity.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-loss-of-prop-reactivity: "error" */
  export let prop = 42
  /* ✓ GOOD */
  $: double1 = prop * 2
  /* ✗ BAD */
  let double1 = prop * 2
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-loss-of-prop-reactivity.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-loss-of-prop-reactivity.ts)
