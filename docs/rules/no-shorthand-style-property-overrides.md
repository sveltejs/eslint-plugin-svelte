---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-shorthand-style-property-overrides"
description: "disallow shorthand style properties that override related longhand properties"
---

# @ota-meshi/svelte/no-shorthand-style-property-overrides

> disallow shorthand style properties that override related longhand properties

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule reports when a shorthand style property overrides a previously defined longhand property.

This rule was inspired by [Stylelint's declaration-block-no-shorthand-property-overrides rule](https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-shorthand-style-property-overrides: "error" */
  let red = "red"
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

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :books: Further reading

- [Stylelint - declaration-block-no-shorthand-property-overrides]

[stylelint - declaration-block-no-shorthand-property-overrides]: https://stylelint.io/user-guide/rules/list/declaration-block-no-shorthand-property-overrides/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-shorthand-style-property-overrides.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-shorthand-style-property-overrides.ts)
