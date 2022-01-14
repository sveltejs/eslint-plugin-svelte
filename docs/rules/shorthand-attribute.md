---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/shorthand-attribute"
description: "enforce use of shorthand syntax in attribute"
since: "v0.5.0"
---

# @ota-meshi/svelte/shorthand-attribute

> enforce use of shorthand syntax in attribute

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of the shorthand syntax in attribute.

<ESLintCodeBlock fix>

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/shorthand-attribute: "error" */
</script>

<!-- ✓ GOOD -->
<button {disabled}>...</button>

<!-- ✗ BAD -->
<button disabled={disabled}>...</button>
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/shorthand-attribute": [
    "error",
    {
      "prefer": "always" // "never"
    }
  ]
}
```

- `prefer`
  - `"always"` ... Expects that the shorthand will be used whenever possible. This is default.
  - `"never"` ... Ensures that no shorthand is used in any attribute.

## :couple: Related Rules

- [@ota-meshi/svelte/shorthand-directive]

[@ota-meshi/svelte/shorthand-directive]: ./shorthand-directive.md

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/shorthand-attribute.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/shorthand-attribute.ts)
