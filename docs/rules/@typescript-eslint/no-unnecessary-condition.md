---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/@typescript-eslint/no-unnecessary-condition"
description: "disallow conditionals where the type is always truthy or always falsy"
---

# svelte/@typescript-eslint/no-unnecessary-condition

> disallow conditionals where the type is always truthy or always falsy

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/@typescript-eslint/no-unnecessary-condition: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->

```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/@typescript-eslint/no-unnecessary-condition": ["error", {
   
  }]
}
```

- 

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/@typescript-eslint/no-unnecessary-condition.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/@typescript-eslint/no-unnecessary-condition.ts)

<sup>Taken with ❤️ [from @typescript-eslint/eslint-plugin](https://typescript-eslint.io/rules/no-unnecessary-condition/)</sup>
