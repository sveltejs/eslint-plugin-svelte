---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-extra-reactive-curlies"
description: "disallow unnecessary curly braces around reactive statements"
---

# svelte/no-extra-reactive-curlies

> disallow unnecessary curly braces around reactive statements

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

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.4.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-extra-reactive-curlies.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-extra-reactive-curlies.ts)
