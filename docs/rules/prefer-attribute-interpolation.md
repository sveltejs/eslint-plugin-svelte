---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-attribute-interpolation'
description: 'require attribute interpolation instead of template literals'
since: 'v3.23.0'
---

# svelte/prefer-attribute-interpolation

> require attribute interpolation instead of template literals

## :book: Rule Details

This rule reports a dynamic JavaScript template literal used as an attribute's entire value.
Svelte's attribute interpolation syntax can represent the same value without the enclosing template
literal.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-attribute-interpolation: "error" */
  let name = 'world';
</script>

<!-- ✓ GOOD -->
<div title="Hello {name}" />

<!-- ✗ BAD -->
<div title={`Hello ${name}`} />
```

Embedded template literals, conditional expressions, style directives, template literals containing
comments, escapes with distinct runtime semantics, line breaks, or raw opening braces, and string
concatenation are not reported. String concatenation can be handled separately with ESLint's
[`prefer-template`] rule.

## :wrench: Options

Nothing.

## :couple: Related Rules

- [`prefer-template`]

[`prefer-template`]: https://eslint.org/docs/latest/rules/prefer-template

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.23.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-attribute-interpolation.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-attribute-interpolation.ts)
