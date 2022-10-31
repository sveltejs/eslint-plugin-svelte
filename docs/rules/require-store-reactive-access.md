---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/require-store-reactive-access"
description: "disallow to render store itself. Need to use $ prefix or get function."
---

# svelte/require-store-reactive-access

> disallow to render store itself. Need to use $ prefix or get function.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-store-reactive-access: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->

```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/require-store-reactive-access": ["error", {
   
  }]
}
```

- 

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/require-store-reactive-access.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/require-store-reactive-access.ts)
