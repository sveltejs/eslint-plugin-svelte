---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-extra-reactive-curlies"
description: "disallow wrapping single reactive statements in curly braces"
---

# svelte/no-extra-reactive-curlies

> disallow wrapping single reactive statements in curly braces

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports if curly brackets (`{` and `}`) are used unnecessarily around a reactive statement body containing only a single expression.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-extra-reactive-curlies: "error" */

  /* ✓ GOOD */
  $: foo = "red"

  /* ✗ BAD */
  $: {
    foo = "red"
  }
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/reactive-curlies` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-extra-reactive-curlies.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-extra-reactive-curlies.ts)
