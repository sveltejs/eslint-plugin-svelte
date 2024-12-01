---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-dupe-style-properties'
description: 'disallow duplicate style properties'
since: 'v0.31.0'
---

# svelte/no-dupe-style-properties

> disallow duplicate style properties

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports duplicate style properties.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dupe-style-properties: "error" */
  let red = 'red';
</script>

<!-- ✓ GOOD -->
<div style="background: green; background-color: {red};">...</div>
<div style:background="green" style="background-color: {red}">...</div>

<!-- ✗ BAD -->
<div style="background: green; background: {red};">...</div>
<div style:background="green" style="background: {red}">...</div>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.31.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-dupe-style-properties.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-dupe-style-properties.ts)
