---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/html-self-closing"
description: "enforce self-closing style"
---

# svelte/html-self-closing

> enforce self-closing style

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

You can choose either two styles for elements without content

- always: `<div />`
- never: `<div></div>`

<ESLintCodeBlock fix>

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
<svelte:head></svelte:head>
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## :wrench: Options

```jsonc
{
  "svelte/html-self-closing": [
    "error",
    {
      "void": "always", // or "always" or "ignore"
      "normal": "always", // or "never" or "ignore"
      "component": "always", // or "never" or "ignore"
      "svelte": "always" // or "never" or "ignore"
    }
  ]
}
```

- `void` (`"always"` by default)... Style of HTML void elements
- `component` (`"always"` by default)... Style of svelte components
- `svelte` (`"always"` by default)... Style of svelte special elements (`<svelte:head>`, `<svelte:self>`)
- `normal` (`"always"` by default)... Style of other elements

Every option can be set to
- "always" (`<div />`)
- "never" (`<div></div>`)
- "ignore" (either `<div />` or `<div></div>`)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/html-self-closing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/html-self-closing.ts)
