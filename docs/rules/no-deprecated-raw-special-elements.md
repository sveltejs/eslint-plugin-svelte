---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-deprecated-raw-special-elements'
description: 'Recommends not using raw special elements in Svelte versions previous to 5.'
since: 'v3.0.0-next.1'
---

# svelte/no-deprecated-raw-special-elements

> Recommends not using raw special elements in Svelte versions previous to 5.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the usage of `head`, `body`, `window`, `document`, `element` and `options` HTML elements. These elements were valid in in versions proior to 5, but since Svelte 5 they must be used with `svelte:`.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-deprecated-raw-special-elements: "error" */
</script>

<!-- ✓ GOOD -->
<svelte:head>
  <title>Valid</title>
</svelte:head>

<!-- ✗ BAD -->
<head>
  <title>Invalid</title>
</head>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- See special elements section in [Svelte docs](https://svelte.dev/docs/svelte/svelte-window)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.0.0-next.1

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-deprecated-raw-special-elements.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-deprecated-raw-special-elements.ts)
