---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/shorthand-directive'
description: 'enforce use of shorthand syntax in directives'
since: 'v0.24.0'
---

# svelte/shorthand-directive

> enforce use of shorthand syntax in directives

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of the shorthand syntax in directives.

<ESLintCodeBlock fix>

<!-- prettier-ignore-start -->

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/shorthand-directive: "error" */
  let value = 'hello!'
  let active = true
  let color = 'red'
</script>

<!-- ✓ GOOD -->
<input bind:value>
<div class:active>...</div>
<div style:color>...</div>

<!-- ✗ BAD -->
<input bind:value={value}>
<div class:active={active}>...</div>
<div style:color={color}>...</div>
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## 🔧 Options

```json
{
  "svelte/shorthand-directive": [
    "error",
    {
      "prefer": "always" // "never"
    }
  ]
}
```

- `prefer`
  - `"always"` ... Expects that the shorthand will be used whenever possible. This is default.
  - `"never"` ... Ensures that no shorthand is used in any directive.

## :couple: Related Rules

- [svelte/shorthand-attribute]

[svelte/shorthand-attribute]: ./shorthand-directive.md

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.24.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/shorthand-directive.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/shorthand-directive.ts)
