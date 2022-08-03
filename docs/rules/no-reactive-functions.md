---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-reactive-functions"
description: "It's not necessary to define functions in reactive statements"
---

# svelte/no-reactive-functions

> It's not necessary to define functions in reactive statements

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports whenever a function is defined in a reactive statement. This isn't necessary, as each time the function is executed it'll already have access to the latest values necessary. Redefining the function in the reactive statement is just a waste of CPU cycles.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-functions: "error" */

  /* ✓ GOOD */
  const arrowFn = () => { /* ... */ }
  const func = function() { /* ... */ }
  
  /* ✗ BAD */
  $: arrowFn = () => { /* ... */ }
  $: func = function() { /* ... */ }
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/reactive-functions` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/
## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-reactive-functions.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-reactive-functions.ts)
