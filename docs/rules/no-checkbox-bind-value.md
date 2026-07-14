---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-checkbox-bind-value'
description: 'disallow useless `bind:value` on `<input type="checkbox">`'
---

# svelte/no-checkbox-bind-value

> disallow useless `bind:value` on `<input type="checkbox">`

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:svelte/recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports `bind:value` on `<input type="checkbox">` elements.. It is a common mistake to use `bind:value` with checkboxes instead of the appropriate `bind:checked`.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-checkbox-bind-value: "error" */
</script>

<!-- ✓ GOOD -->
<input type="checkbox" bind:checked={...}>

<!-- ✗ BAD -->
<input type="checkbox" bind:value={...}>
```

## :wrench: Options

Nothing.

## :mute: When Not To Use It

You may need to set the `value` attribute of an `<input type="checkbox">` element dynamically. However, `bind:value` should never be necessary, because a checkbox's `value` does not change through user interaction.

## :books: Further Reading

- [Svelte - Tutorial > Basic Svelte / Bindings / Checkbox inputs](https://svelte.dev/tutorial/svelte/checkbox-inputs)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-checkbox-bind-value.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-checkbox-bind-value.ts)
