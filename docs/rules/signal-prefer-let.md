---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/signal-prefer-let'
description: 'use let instead of const for signals values'
---

# svelte/signal-prefer-let

> use let instead of const for signals values

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports whenever a signal is assigned to a const.
In JavaScript `const` are defined as immutable references which cannot be reassigned.
Signals are by definition changing and are reassigned by Svelte's reactivity system.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/signal-prefer-let: "error" */

  /* ✓ GOOD */
  let { value } = $props();

  let doubled = $derived(value * 2);

  /* ✗ BAD */
  const { value } = $props();

  const doubled = $derived(value * 2);
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/signal-prefer-let.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/signal-prefer-let.ts)
