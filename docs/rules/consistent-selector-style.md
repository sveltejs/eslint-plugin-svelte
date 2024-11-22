---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/consistent-selector-style'
description: 'enforce a consistent style for CSS selectors'
---

# svelte/consistent-selector-style

> enforce a consistent style for CSS selectors

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/consistent-selector-style: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/consistent-selector-style": ["error", {}]
}
```

-

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/consistent-selector-style.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/consistent-selector-style.ts)
