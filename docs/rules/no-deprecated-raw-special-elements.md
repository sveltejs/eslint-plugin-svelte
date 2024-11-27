---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-deprecated-raw-special-elements'
description: 'Disallows valid Svelte 4 tags, that no are no longer valid in Svelte 5'
---

# svelte/no-deprecated-raw-special-elements

> Recommends not using raw special elements in Svelte versions previous to 5.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the usage of `head`, `body`, `window`, `document`, `element` and `options` HTML elements. These elements were valid in in versions proior to 5, but since Svelte 5 they must be used with `svelte:`.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-invalid-html-elements: "error" */
</script>

<!-- ✓ GOOD -->
<svelte:head>
  <title>Invalid HTML Elements</title>
</svelte:head>

<!-- ✗ BAD -->
<head>
  <title>Invalid HTML Elements</title>
</head>
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/no-invalid-html-elements": ["error", {}]
}
```

## :books: Further Reading

- See special elements section in [Svelte docs](https://svelte.dev/docs/svelte/svelte-window)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-deprecated-raw-special-elements.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-deprecated-raw-special-elements.ts)
