---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-writable-derived'
description: 'Prefer using writable $derived instead of $state and $effect'
since: 'v3.6.0'
---

# svelte/prefer-writable-derived

> Prefer using writable $derived instead of $state and $effect

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

The rule does not report a variable that is mutated through its properties (e.g. `value.name = 'foo'`, `bind:value={value.name}`, `value.push(item)` or `Object.assign(value, other)`). `$state` makes objects and arrays [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state), but [`$derived` does not](https://svelte.dev/docs/svelte/$derived#Deriveds-and-reactivity), so such mutations would no longer update the UI.

The rule also follows values that share the same object, such as `{#each value.items as item}`, `const { profile } = value`, `value.items.forEach((item) => ...)`, `<Child bind:value />` and arguments of local functions and snippets. It does not follow values passed to imported functions, passed to components as props without `bind:`, or stored in other objects.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-writable-derived: "error" */
  const { data } = $props();

  // ✓ GOOD
  let user = $state(data.user);
  $effect(() => {
    user = data.user;
  });
</script>

<input bind:value={user.name} />
```

## :wrench: Options

Nothing.

- This rule has no options.

## :books: Further Reading

- [Svelte Documentation on Reactivity Primitives](https://svelte.dev/docs/svelte-components#script-2-assignments-are-reactive)
- [Svelte RFC for Reactivity Primitives](https://github.com/sveltejs/rfcs/blob/rfc-better-primitives/text/0000-better-primitives.md)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-writable-derived.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-writable-derived.ts)
