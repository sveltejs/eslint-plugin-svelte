---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/@typescript-eslint/no-unnecessary-condition'
description: 'disallow conditionals where the type is always truthy or always falsy'
since: 'v2.9.0'
---

# svelte/@typescript-eslint/no-unnecessary-condition

> disallow conditionals where the type is always truthy or always falsy

- :warning: This rule was **deprecated**. This rule is no longer needed when using svelte-eslint-parser>=v0.19.0.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

**This rule is no longer needed when using svelte-eslint-parser>=v0.19.0.**

This rule extends the base `@typescript-eslint`'s [@typescript-eslint/no-unnecessary-condition] rule.
The [@typescript-eslint/no-unnecessary-condition] rule does not understand reactive or rerendering of Svelte components and has false positives when used with Svelte components. This rule understands reactive and rerendering of Svelte components.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/@typescript-eslint/no-unnecessary-condition: "error" */
  export let foo: number | null = null;
  /* ✗ BAD */
  let b = foo || 42;
  /* ✓ GOOD */
  $: a = foo || 42;
</script>

<!-- ✓ GOOD -->
{foo || 42}
```

## :wrench: Options

```json
{
  "@typescript-eslint/no-unnecessary-condition": "off",
  "svelte/@typescript-eslint/no-unnecessary-condition": [
    "error",
    {
      "allowConstantLoopConditions": false,
      "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": false
    }
  ]
}
```

Same as [@typescript-eslint/no-unnecessary-condition] rule option. See [here](https://typescript-eslint.io/rules/no-unnecessary-condition/#options) for details.

## :couple: Related rules

- [@typescript-eslint/no-unnecessary-condition]

[@typescript-eslint/no-unnecessary-condition]: https://typescript-eslint.io/rules/no-unnecessary-condition/

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.9.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/@typescript-eslint/no-unnecessary-condition.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/@typescript-eslint/no-unnecessary-condition.ts)

<sup>Taken with ❤️ [from @typescript-eslint/eslint-plugin](https://typescript-eslint.io/rules/no-unnecessary-condition/)</sup>
