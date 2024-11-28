---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-destructured-store-props'
description: 'destructure values from object stores for better change tracking & fewer redraws'
since: 'v2.10.0'
---

# svelte/prefer-destructured-store-props

> destructure values from object stores for better change tracking & fewer redraws

- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule reports on directly accessing properties of a store containing an object in templates. These usages can instead be written as a reactive statement using destructuring to allow for more granular change-tracking and reduced redraws in the component.

An example of the improvements can be see in this [REPL](https://svelte.dev/repl/7de86fea94ff40c48abb82da534dfb89)

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-destructured-store-props: "error" */
  import store from './store.js';
  $: ({ foo } = $store);
</script>

<!-- ✓ GOOD -->
{foo}

<!-- ✗ BAD -->
{$store.foo}
```

## :wrench: Options

Nothing

## :heart: Compatibility

This rule was taken from [@tivac/eslint-plugin-svelte].  
This rule is compatible with `@tivac/svelte/store-prop-destructuring` rule.

[@tivac/eslint-plugin-svelte]: https://github.com/tivac/eslint-plugin-svelte/

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.10.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-destructured-store-props.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-destructured-store-props.ts)
