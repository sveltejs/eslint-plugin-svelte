---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-spaces-around-equal-signs-in-attribute'
description: 'disallow spaces around equal signs in attribute'
since: 'v2.3.0'
---

# svelte/no-spaces-around-equal-signs-in-attribute

> disallow spaces around equal signs in attribute

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallows spaces around equal signs in attributes

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-spaces-around-equal-signs-in-attribute: "error" */
</script>

<!-- ✓ GOOD -->
<div class=""/>
<p style="color: red;">hi</p>
<img src="img.png" alt="A photo of a very cute {animal}">

<!-- ✗ BAD -->
<div class = ""/>
<p style ="color: red;">hi</p>
<img src
    =
    "img.png" alt   = "A photo of a very cute {animal}">
```

<!-- prettier-ignore-end -->

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.3.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-spaces-around-equal-signs-in-attribute.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-spaces-around-equal-signs-in-attribute.ts)
