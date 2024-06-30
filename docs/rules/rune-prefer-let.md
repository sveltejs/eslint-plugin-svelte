---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/rune-prefer-let'
description: 'use let instead of const for reactive variables created by runes'
---

# svelte/rune-prefer-let

> use let instead of const for reactive variables created by runes

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports whenever a rune that creates a reactive value is assigned to a const.
In JavaScript `const` are defined as immutable references which cannot be reassigned.
Reactive variables can be reassigned by Svelte's reactivity system.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/rune-prefer-let: "error" */

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

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/rune-prefer-let.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/rune-prefer-let.ts)
