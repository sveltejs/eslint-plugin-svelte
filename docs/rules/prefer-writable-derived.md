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

The rule does not report a variable whose object may be mutated (e.g. `value.name = 'foo'`, `bind:value={value.name}` or `value.push(item)`). `$state` makes arrays and plain objects [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state), but [`$derived` does not](https://svelte.dev/docs/svelte/$derived#Deriveds-and-reactivity), so such mutations would no longer update the UI.

To be safe, the rule reports a variable only when it can see every use of the object:

- If every value assigned to the variable is a primitive (e.g. `count * 2`), the object can't be mutated, so the rule reports it.
- It follows values that share the object, such as `const { profile } = value`, `{#each value.items as item}`, `value.items.forEach((item) => ...)`, `[...value]`, local functions and snippets, and values returned from them.
- Reading the object is fine. This includes text and attributes of HTML elements in the template, built-in methods that don't mutate (e.g. `value.items.map(...)`, `value.name.trim()`), and built-in functions such as `JSON.stringify(value)` and `$state.snapshot(value)`.
- A copy such as `value.slice()`, `[...value]` or `...rest` is new, so changing the copy itself is fine, but changing its elements is not.
- Any other use is treated as a mutation. For example, passing the object to an imported function (e.g. `setContext('user', value)`), calling a method that is not built in (e.g. `value.save()`), storing it in another object, passing it to a component (a component can give it back through a callback, a snippet or a binding), `value` of `<option>` and `<input>` (`bind:value` and `bind:group` give it back), or returning it to outside of the file.

Methods are matched by name only when the object is known to be built-in: a part of the object (`$state` proxies only arrays and plain objects), a local array literal or a string. A method of such an object that has the name of a built-in method (e.g. `map` or `toString`) is treated as the built-in method.

The rule can't see getters or methods (e.g. `toString` or `toJSON`) that the object gets from outside of the file, such as from props. If they change the object, check it yourself before applying the suggestion.

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
