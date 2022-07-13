---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/html-self-closing"
description: "Enforce self-closing style"
since: "v2.2.0"
---

# svelte/html-self-closing

> Enforce self-closing style

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

You can choose either two styles for elements without content

- always: `<divi />`
- never: `<div></div>`

This rule enforces the quotes style of HTML attributes.

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
<img>

<!-- ✗ BAD -->
<div></div>
<p> </p>
<div><div></div></div>
<img />
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/html-self-closing": [
    "error",
    {
      "html": {
        "void": "never", // or "always" or "any"
        "normal": "always", // or "never" or "any"
        "custom": "always" // or "never" or "any"
      }
    }
  ]
}
```

- `html.void` (`"never"` by default)... Style of HTML void elements
- `html.component` (`"always"` by default)... Style of svelte components
- `html.normal` (`"always"` by default)... Style of other elements

Every option can be set to
- "always" (`<div />`)
- "never" (`<div></div>`)
- "any" (either `<div />` or `<div></div>`)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/html-self-closing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/html-self-closing.ts)
