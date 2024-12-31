---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-let'
description: 'Prefer `let` over `const` for Svelte 5 reactive variable declarations.'
---

# svelte/prefer-let

> Prefer `let` over `const` for Svelte 5 reactive variable declarations.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports usages of `const` variable declarations on Svelte reactive
function assignments. While values may not be reassigned in the code itself,
they are reassigned by Svelte.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-let: "error" */

  // ✓ GOOD
  let { a, b } = $props();
  let c = $state('');
  let d = $derived(a * 2);
  let e = $derived.by(() => b * 2);

  // ✗ BAD
  const g = $state(0);
  const h = $derived({ count: g });
</script>
```

## :wrench: Options

```json
{
  "svelte/prefer-const": [
    "error",
    {
      "exclude": ["$props", "$derived", "$derived.by", "$state", "$state.raw"]
    }
  ]
}
```

- `exclude`: The reactive assignments that you want to exclude from being
reported..

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-let.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-let.ts)
