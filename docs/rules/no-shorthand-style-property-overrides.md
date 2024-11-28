---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-shorthand-style-property-overrides'
description: 'disallow shorthand style properties that override related longhand properties'
since: 'v0.31.0'
---

# svelte/no-shorthand-style-property-overrides

> disallow shorthand style properties that override related longhand properties

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports when a shorthand style property overrides a previously defined longhand property.

This rule was inspired by [Stylelint's declaration-block-no-shorthand-property-overrides rule](https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/).

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-shorthand-style-property-overrides: "error" */
  let red = 'red';
</script>

<!-- ✓ GOOD -->
<div style:background-repeat="repeat" style:background-color="green">...</div>
<div style="background-repeat: repeat; background-color: {red};">...</div>
<div style:background-repeat="repeat" style="background-color: {red}">...</div>

<!-- ✗ BAD -->
<div style:background-repeat="repeat" style:background="green">...</div>
<div style="background-repeat: repeat; background: {red};">...</div>
<div style:background-repeat="repeat" style="background: {red}">...</div>
```

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - declaration-block-no-shorthand-property-overrides]

[stylelint - declaration-block-no-shorthand-property-overrides]: https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.31.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-shorthand-style-property-overrides.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-shorthand-style-property-overrides.ts)
