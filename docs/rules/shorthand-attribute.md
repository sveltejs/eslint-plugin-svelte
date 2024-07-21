---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/shorthand-attribute'
description: 'enforce use of shorthand syntax in attribute'
since: 'v0.5.0'
---

# svelte/shorthand-attribute

> enforce use of shorthand syntax in attribute

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of the shorthand syntax in attribute.

<ESLintCodeBlock fix>

<!-- prettier-ignore-start -->

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/shorthand-attribute: "error" */
</script>

<!-- ✓ GOOD -->
<button {disabled}>...</button>

<!-- ✗ BAD -->
<button disabled={disabled}>...</button>
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## 🔧 Options

```json
{
  "svelte/shorthand-attribute": [
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

- [svelte/shorthand-directive]

[svelte/shorthand-directive]: ./shorthand-directive.md

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.5.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/shorthand-attribute.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/shorthand-attribute.ts)
