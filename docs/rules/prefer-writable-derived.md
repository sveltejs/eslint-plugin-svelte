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
- It follows values that share the object or a part of it: `const { profile } = value`, `{#each value.items as item}`, parameters of callbacks of built-in array methods (e.g. `value.items.filter((item) => ...)`), results of such methods (e.g. `value.items.slice()` or `[...value.items]`), and `$derived(...)`.
- Reading is fine: text and attributes of HTML elements in the template, built-in methods that don't mutate (e.g. `value.items.includes(x)`, `value.name.trim()`), and functions such as `JSON.stringify(value)`, `$state.snapshot(value)` and `console.log(value)`.
- Any other use is treated as a mutation. This includes:
  - calling a mutating or unknown method (e.g. `value.push(item)` or `value.save()`), also on a copy such as `[...value].sort()`;
  - passing the object to any other function, including local functions and snippets (e.g. `setContext('user', value)` or `{@render row(value)}`);
  - returning it from a function, except from `$derived.by()`, or returning the parameter of a callback of a built-in array method (or a part of it) from that callback;
  - storing it in an object (e.g. `{ ...value }` or `box.user = value`);
  - giving it to a component, a custom element, `<svelte:element>` or `<slot>`, or as `value` (or the only text) of `<option>` or `value` of `<input>`;
  - `bind:` of a part of it, or of an `{#each}` item;
  - `instanceof` with a class that is not a global identifier;
  - a default value of a prop or an assignment to a prop (a custom element exposes it).

The rule assumes that the object is data: it doesn't have getters, setters or methods that change it (e.g. `{ get first() { this.items[0].done = true } }`). `$state` proxies such plain objects too, so if the object has them, check it yourself before applying the suggestion. It also assumes that global names such as `JSON`, `console` and `Array` are the built-in ones.

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
