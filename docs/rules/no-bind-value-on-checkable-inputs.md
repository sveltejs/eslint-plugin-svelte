---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-bind-value-on-checkable-inputs'
description: 'disallow useless `bind:value` on `<input type="checkbox">` and `<input type="radio">`'
since: 'v3.21.0'
---

# svelte/no-bind-value-on-checkable-inputs

> disallow useless `bind:value` on `<input type="checkbox">` and `<input type="radio">`

- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports `bind:value` on `<input type="checkbox">` and `<input type="radio">` elements. For most `<input>` types, `bind:value` is used to bind the user-editable state. Checkboxes and radios are an exception, as their state is represented by the `checked` property instead. As a result, using `bind:value` instead of `bind:checked` on a checkbox or radio is a common mistake.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-bind-value-on-checkable-inputs: "error" */
</script>

<!-- ✓ GOOD -->
<input type="checkbox" bind:checked={...}>
<input type="checkbox" bind:group={...}>

<!-- ✗ BAD -->
<input type="checkbox" bind:value={...}>
```

```svelte
<script>
  /* eslint svelte/no-bind-value-on-checkable-inputs: "error" */
</script>

<!-- ✓ GOOD -->
<input type="radio" bind:group={...}>

<!-- ✗ BAD -->
<input type="radio" bind:value={...}>
```

## :wrench: Options

Nothing.

## :mute: When Not To Use It

You may need to set the `value` attribute of an `<input type="checkbox">` or `<input type="radio">` element dynamically. However, `bind:value` should never be necessary, because the `value` does not change through user interaction.

## :books: Further Reading

- [Svelte - Tutorial > Basic Svelte / Bindings / Checkbox inputs](https://svelte.dev/tutorial/svelte/checkbox-inputs)
- [Svelte - Tutorial > Basic Svelte / Bindings / Group inputs](https://svelte.dev/tutorial/svelte/group-inputs)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.21.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-bind-value-on-checkable-inputs.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-bind-value-on-checkable-inputs.ts)
