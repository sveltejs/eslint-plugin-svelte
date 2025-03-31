---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-writable-derived'
description: 'Prefer using writable $derived instead of $state and $effect'
---

# svelte/prefer-writable-derived

> Prefer using writable $derived instead of $state and $effect

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:svelte/recommended"`.
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports when you use a combination of `$state` and `$effect` to create a derived value that can be written to. It encourages using the more concise and clearer `$derived` syntax instead.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-writable-derived: "error" */
  const { initialValue } = $props();

  // ✓ GOOD
  let value1 = $derived(initialValue);

  // ✗ BAD
  let value2 = $state(initialValue);
  $effect(() => {
    value2 = initialValue;
  });
</script>
```

The rule specifically looks for patterns where:

1. You initialize a variable with `$state()`
2. You then use `$effect()` or `$effect.pre()` to assign a new value to that same variable
3. The effect function contains only a single assignment statement

When this pattern is detected, the rule suggests refactoring to use `$derived()` instead, which provides the same functionality in a more concise way.

## :wrench: Options

Nothing.

- This rule has no options.

## :books: Further Reading

- [Svelte Documentation on Reactivity Primitives](https://svelte.dev/docs/svelte-components#script-2-assignments-are-reactive)
- [Svelte RFC for Reactivity Primitives](https://github.com/sveltejs/rfcs/blob/rfc-better-primitives/text/0000-better-primitives.md)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-writable-derived.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-writable-derived.ts)
