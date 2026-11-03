---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-derived-over-derived-by'
description: 'disallow unnecessary `$derived.by()` when `$derived()` is sufficient'
since: 'v3.18.0'
---

# svelte/prefer-derived-over-derived-by

> disallow unnecessary `$derived.by()` when `$derived()` is sufficient

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

`$derived.by()` accepts a function and runs it to compute the derived value. It is only needed when the derivation requires statements such as loops, intermediate variables, or side effects. When the function body is a single expression, `$derived(expression)` produces the same result with less ceremony.

This rule reports `$derived.by()` calls whose argument is a zero-parameter, non-async, non-generator function that either uses a concise arrow body or a block body containing only a single `return` statement, and offers an autofix that converts them to `$derived()`.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-derived-over-derived-by: "error" */

  let a = $state({ b: 1 });

  // ✓ GOOD
  const foo = $derived(a.b);

  // ✓ GOOD: multi-statement body
  const bar = $derived.by(() => {
    const c = a.b * 2;
    return c + 1;
  });

  // ✗ BAD
  const baz = $derived.by(() => a.b);

  // ✗ BAD
  const qux = $derived.by(() => {
    return a.b;
  });
</script>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.18.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-derived-over-derived-by.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-derived-over-derived-by.ts)
