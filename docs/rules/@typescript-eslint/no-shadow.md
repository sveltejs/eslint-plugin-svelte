---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/@typescript-eslint/no-shadow'
description: 'Disallow variable declarations from shadowing variables declared in the outer scope'
---

# svelte/@typescript-eslint/no-shadow

> Disallow variable declarations from shadowing variables declared in the outer scope

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports shadowed variables, similar to the base ESLint `@typescript-eslint/no-shadow` rule. However, it ignores cases where `{#snippet}` is used as a named slot in Svelte components. If this rule is active, make sure to disable the base `@typescript-eslint/no-shadow` and `svelte/no-shadow` and `no-shadow` rule, as it will conflict with this rule.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/@typescript-eslint/no-shadow: "error" */
  import ComponentWithSnippet from './ComponentWithSnippet.svelte';
</script>

<!-- ✓ GOOD -->
<ComponentWithSnippet>
  {#snippet children()}
    <AnotherComponentWithSnippet>
      {#snippet children()}
        Hello!
      {/snippet}
    </AnotherComponentWithSnippet>
  {/snippet}
</ComponentWithSnippet>
<!-- ✗ BAD -->
<ComponentWithSnippet>
  {@const foo = 1}
  <ComponentWithSnippet>
    {@const foo = 2}
  </ComponentWithSnippet>
</ComponentWithSnippet>
```

## :wrench: Options

```json
{
  "svelte/no-shadow": [
    "error",
    { "builtinGlobals": false, "hoist": "functions", "allow": [], "ignoreOnInitialization": false }
  ]
}
```

- `builtinGlobals`: The `builtinGlobals` option is `false` by default. If it is `true`, the rule prevents shadowing of built-in global variables: `Object`, `Array`, `Number`, and so on.
- `hoist`: The `hoist` option has three settings:
  - `functions` (by default) - reports shadowing before the outer functions are defined.
  - `all` - reports all shadowing before the outer variables/functions are defined.
  - `never` - never report shadowing before the outer variables/functions are defined.
- `allow`: The `allow` option is an array of identifier names for which shadowing is allowed. For example, `"resolve"`, `"reject"`, `"done"`, `"cb"`.
- `ignoreOnInitialization`: The `ignoreOnInitialization` option is `false` by default. If it is `true`, it prevents reporting shadowing of variables in their initializers when the shadowed variable is presumably still uninitialized. The shadowed variable must be on the left side. The shadowing variable must be on the right side and declared in a callback function or in an IIFE.
- `ignoreTypeValueShadow`: Whether to ignore types named the same as a variable. Default: `true`. This is generally safe because you cannot use variables in type locations without a `typeof` operator, so there's little risk of confusion.
- `ignoreFunctionTypeParameterNameValueShadow`: Whether to ignore function parameters named the same as a variable. Default: `true`. Each of a function type's arguments creates a value variable within the scope of the function type. This is done so that you can reference the type later using the `typeof` operator.

## :books: Further Reading

- See [typescript-eslint `no-shadow` rule](https://typescript-eslint.io/rules/no-shadow/) for more information about the base rule.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/@typescript-eslint/no-shadow.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/@typescript-eslint/no-shadow.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/@typescript-eslint/no-shadow)</sup>
