---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-dupe-style-properties"
description: "disallow duplicate style properties"
---

# @ota-meshi/svelte/no-dupe-style-properties

> disallow duplicate style properties

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule reports duplicate style properties.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-dupe-style-properties: "error" */
  let red = "red"
</script>

<!-- ✓ GOOD -->
<div style="background: green; background-color: {red};">...</div>
<div style:background="green" style="background-color: {red}">...</div>

<!-- ✗ BAD -->
<div style="background: green; background: {red};">...</div>
<div style:background="green" style="background: {red}">...</div>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-dupe-style-properties.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-dupe-style-properties.ts)
