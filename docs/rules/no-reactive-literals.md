---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-reactive-literals"
description: "Don't assign literal values in reactive statements"
---

# svelte/no-reactive-literals

> Don't assign literal values in reactive statements

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports on any assignment of a static, unchanging value within a reactive statement because it's not necessary.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-literals: "error" */
  /* ✓ GOOD */
  let foo = "bar"

  /* ✗ BAD */
  $: foo = "bar"
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/reactive-literals` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-reactive-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-reactive-literals.ts)
