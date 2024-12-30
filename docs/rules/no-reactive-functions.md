---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-reactive-functions'
description: "it's not necessary to define functions in reactive statements"
since: 'v2.5.0'
---

# svelte/no-reactive-functions

> it's not necessary to define functions in reactive statements

- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports whenever a function is defined in a reactive statement. This isn't necessary, as each time the function is executed it'll already have access to the latest values necessary. Redefining the function in the reactive statement is just a waste of CPU cycles.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-functions: "error" */

  /* ✓ GOOD */
  const arrowFn = () => {
    /* ... */
  };
  const func = function () {
    /* ... */
  };

  /* ✗ BAD */
  $: arrowFn = () => {
    /* ... */
  };
  $: func = function () {
    /* ... */
  };
</script>
```

## :wrench: Options

Nothing

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/reactive-functions` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-reactive-functions.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-reactive-functions.ts)
