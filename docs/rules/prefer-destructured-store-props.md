---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/prefer-destructured-store-props"
description: "Destructure store props for more efficient redraws"
---

# svelte/prefer-destructured-store-props

> Destructure store props for more efficient redraws

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports on directly accessing properties of a store containing an object. These usages can instead be written as a reactive statement using destructuring to allow for more granular change-tracking and reduced redraws in the component.

An example of the improvements can be see in this [REPL](https://svelte.dev/repl/7de86fea94ff40c48abb82da534dfb89)

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-destructured-store-props: "error" */
  $: ({ foo } = $store)
</script>

<!-- ✓ GOOD -->
{foo}

<!-- ✗ BAD -->
{$store.foo}
```

</ESLintCodeBlock>

## :wrench: Options

Nothing

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/store-prop-destructuring` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/prefer-destructured-store-props.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/prefer-destructured-store-props.ts)
