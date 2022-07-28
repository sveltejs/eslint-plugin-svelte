---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-unnecessary-reactive-curlies"
description: "disallow unnecessary curly braces around reactive statements"
since: "v2.4.0"
---

# svelte/no-unnecessary-reactive-curlies

> disallow unnecessary curly braces around reactive statements

## :book: Rule Details

This rule reports if curly brackets (`{` and `}`) are used unnecessarily around a reactive statement body containing only a single expression.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-unnecessary-reactive-curlies: "error" */
  
  /* ✓ GOOD */
  $: foo = "red";

  /* ✗ BAD */
  $: {
    foo = "red";
  }
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.4.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-unnecessary-reactive-curlies.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-unnecessary-reactive-curlies.ts)
