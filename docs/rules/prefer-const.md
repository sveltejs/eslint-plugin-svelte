---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-const'
description: 'Require `const` declarations for variables that are never reassigned after declared'
---

# svelte/prefer-const

> Require `const` declarations for variables that are never reassigned after declared

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the same as the base ESLint `prefer-const` rule, except that ignores Svelte reactive values such as `$state`, `$derived` and `$props`. If this rule is active, make sure to disable the base `prefer-const` rule, as it will conflict with this rule.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-const: "error" */

  // ✓ GOOD
  const { a, b } = $props();
  let { a, b } = $state();

  // ✗ BAD
  // Imagine obj is not re-assigned, therefore it should be constant
  let obj = { a, b };
</script>
```

## :wrench: Options

```json
{
  "svelte/prefer-const": [
    "error",
    {
      "destructuring": "any",
      "ignoreReadonly": true
    }
  ]
}
```

- `destructuring`: The kind of the way to address variables in destructuring. There are 2 values:
  - `any` (default): if any variables in destructuring should be const, this rule warns for those variables.
  - `all`: if all variables in destructuring should be const, this rule warns the variables. Otherwise, ignores them.
- `ignoreReadonly`: If `true`, this rule will ignore variables that are read between the declaration and the _first_ assignment.

## :books: Further Reading

- See [ESLint `prefer-const` rule](https://eslint.org/docs/latest/rules/prefer-const) for more information about the base rule.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-const.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-const.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/prefer-const)</sup>
