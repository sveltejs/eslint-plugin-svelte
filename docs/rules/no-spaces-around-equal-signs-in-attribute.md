---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-spaces-around-equal-signs-in-attribute"
description: "Disallow spaces around equal signs in attribute"
since: "v2.2.0"
---

# svelte/no-spaces-around-equal-signs-in-attribute

> Disallow spaces around equal signs in attribute

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallows spaces around equal signs in attributes

<ESLintCodeBlock fix>

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

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/no-spaces-around-equal-signs-in-attribute": ["error"]
}
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-spaces-around-equal-signs-in-attribute.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-spaces-around-equal-signs-in-attribute.ts)
