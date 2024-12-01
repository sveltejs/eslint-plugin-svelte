---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/first-attribute-linebreak'
description: 'enforce the location of first attribute'
since: 'v0.6.0'
---

# svelte/first-attribute-linebreak

> enforce the location of first attribute

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to enforce a consistent location for the first attribute.

<!-- prettier-ignore-start -->

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/first-attribute-linebreak: "error" */
</script>

<!-- ✓ GOOD -->
<input type="checkbox" />
<button
  type="button"
  on:click={click} />
<button type="button" on:click={click} />

<!-- ✗ BAD -->
<input
  type="checkbox" />
<button type="button"
  on:click={click} />
<button
  type="button" on:click={click} />
```

<!-- prettier-ignore-end -->

## :wrench: Options

```json
{
  "svelte/first-attribute-linebreak": [
    "error",
    {
      "multiline": "below", // or "beside"
      "singleline": "beside" // "below"
    }
  ]
}
```

- `multiline` ... The location of the first attribute when the attributes span multiple lines. Default is `"below"`.
  - `"below"` ... Requires a newline before the first attribute.
  - `"beside"` ... Disallows a newline before the first attribute.
- `singleline` ... The location of the first attribute when the attributes on single line. Default is `"beside"`.
  - `"below"` ... Requires a newline before the first attribute.
  - `"beside"` ... Disallows a newline before the first attribute.

## :couple: Related Rules

- [svelte/max-attributes-per-line]

[svelte/max-attributes-per-line]: ./max-attributes-per-line.md

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/first-attribute-linebreak.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/first-attribute-linebreak.ts)
