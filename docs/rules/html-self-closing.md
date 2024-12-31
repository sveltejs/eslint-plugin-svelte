---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/html-self-closing'
description: 'enforce self-closing style'
since: 'v2.5.0'
---

# svelte/html-self-closing

> enforce self-closing style

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

You can choose either two styles for elements without content.

- always: `<SomeComponent />`
- never: `<SomeComponent></SomeComponent>`

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/html-self-closing: "error" */
</script>

<!-- ✓ GOOD -->
<p>Hello</p>
<div></div>
<img />
<svelte:head />
<svg><path /></svg>
<math><msup></msup></math>
<SomeComponent />

<!-- ✗ BAD -->
<div />
<div><div /></div>
<svelte:body></svelte:body>
<svg><path></path></svg>
<math><msup /></math>
<SomeComponent></SomeComponent>
```

<!-- prettier-ignore-end -->

## :wrench: Options

presets:

```jsonc
{
  "svelte/html-self-closing": [
    "error",
    "default" // or "all" or "html" or "none"
  ]
}
```

config object:

```jsonc
{
  "svelte/html-self-closing": [
    "error",
    {
      "void": "always", // or "never" or "ignore"
      "normal": "never", // or "always" or "ignore"
      "svg": "always", // or "never" or "ignore"
      "never": "never", // or "always" or "ignore"
      "component": "always", // or "never" or "ignore"
      "svelte": "always" // or "never" or "ignore"
    }
  ]
}
```

presets:

- `default` - MathML and non-void HTML elements should have a closing tag; otherwise, they should be self-closing.
- `all` - all elements should be self-closing (unless they have children)
- `html` - html-compliant - only void elements and svelte special elements should be self-closing
- `none` - no elements should be self-closing

::: warning Note
We recommend selecting `default` as the preset. Choosing any other option may result in settings that are inconsistent with the compiler when using Svelte5.
:::

config object:

- `void` (`"always"` in default preset)... Style of HTML void elements
- `normal` (`"never"` in default preset)... Style of other elements
- `svg` (`"always"` in default preset)... Style of SVG
- `math` (`never` in default preset)... Style of MathML
- `component` (`"always"` in default preset)... Style of svelte components
- `svelte` (`"always"` in default preset)... Style of svelte special elements (`<svelte:head>`, `<svelte:self>`)

::: warning
`foreign` is removed in `eslint-plugin-svelte` v3.
:::

Every config object option can be set to

- "always" (`<SomeComponent />`)
- "never" (`<SomeComponent></SomeComponent>`)
- "ignore" (either `<SomeComponent />` or `<SomeComponent></SomeComponent>`)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/html-self-closing.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/html-self-closing.ts)
