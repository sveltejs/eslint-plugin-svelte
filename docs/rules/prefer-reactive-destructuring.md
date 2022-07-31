---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/prefer-reactive-destructuring"
description: "Prefer destructuring from objects in reactive statements"
---

# svelte/prefer-reactive-destructuring

> Prefer destructuring from objects in reactive statements

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule triggers whenever a reactive statement contains an assignment that could be rewritten using destructuring. This is beneficial because it allows svelte's change-tracking to prevent wasteful redraws whenever the object is changed.

This [svelte REPL](https://svelte.dev/repl/96759f4772314d0a840e11370ef76711) example shows just how effective this can be at preventing bogus redraws.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-reactive-destructuring: "error" */
  /* ✓ GOOD */
  $: ({ foo } = info)
  $: ({ bar: baz } = info)

  /* ✗ BAD */
  $: foo = info.foo
  $: baz = info.bar
</script>


```

</ESLintCodeBlock>

## :wrench: Options

Nothing

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/reactive-destructuring` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/prefer-reactive-destructuring.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/prefer-reactive-destructuring.ts)
