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

You can choose either two styles for elements without content

- always: `<div />`
- never: `<div></div>`

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/html-self-closing: "error" */
</script>

<!-- ✓ GOOD -->
<div />
<p>Hello</p>
<div><div /></div>
<img />
<svelte:head />

<!-- ✗ BAD -->
<div></div>
<p> </p>
<div><div></div></div>
<img>
<svelte:body></svelte:body>
```

<!-- prettier-ignore-end -->

## :wrench: Options

presets:

```jsonc
{
  "svelte/html-self-closing": [
    "error",
    "all" // or "html" or "none"
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
      "normal": "always", // or "never" or "ignore"
      "foreign": "always", // or "never" or "ignore"
      "component": "always", // or "never" or "ignore"
      "svelte": "always" // or "never" or "ignore"
    }
  ]
}
```

presets:

- `all` - all elements should be self closing (unless they have children)
- `html` - html-compliant - only void elements and svelte special elements should be self closing
- `none` - no elements should be self closing

config object:

- `void` (`"always"` in default preset)... Style of HTML void elements
- `foreign` (`"always"` in default preset)... Style of foreign elements (SVG and MathML)
- `component` (`"always"` in default preset)... Style of svelte components
- `svelte` (`"always"` in default preset)... Style of svelte special elements (`<svelte:head>`, `<svelte:self>`)
- `normal` (`"always"` in default preset)... Style of other elements

Every config oject option can be set to

- "always" (`<div />`)
- "never" (`<div></div>`)
- "ignore" (either `<div />` or `<div></div>`)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/html-self-closing.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/html-self-closing.ts)
