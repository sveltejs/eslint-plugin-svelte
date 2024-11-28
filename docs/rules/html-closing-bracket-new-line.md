---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/html-closing-bracket-new-line'
description: "Require or disallow a line break before tag's closing brackets"
since: 'v2.45.0'
---

# svelte/html-closing-bracket-new-line

> Require or disallow a line break before tag's closing brackets

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces a line break (or no line break) before tag's closing brackets, which can also be configured to be enforced on self-closing tags.

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/html-closing-bracket-new-line: "error" */
</script>

<!-- ✓ GOOD -->
<div></div>
<div
  multiline
>
  Children
</div>

<SelfClosing />
<SelfClosing
  multiline
/>

<!-- ✗ BAD -->

<div
></div>
<div
  multiline>
  Children
</div>

<SelfClosing
/>
<SelfClosing
  multiline/>
```

<!-- prettier-ignore-end -->

## :wrench: Options

```json
{
  "svelte/html-closing-bracket-new-line": [
    "error",
    {
      "singleline": "never", // ["never", "always"]
      "multiline": "always", // ["never", "always"]
      "selfClosingTag": {
        "singleline": "never", // ["never", "always"]
        "multiline": "always" // ["never", "always"]
      }
    }
  ]
}
```

- `singleline`: (`"never"` by default) Configuration for single-line elements. It's a single-line element if the element does not have attributes or the last attribute is on the same line as the opening bracket.
- `multiline`: (`"always"` by default) Configuration for multi-line elements. It's a multi-line element if the last attribute is not on the same line of the opening bracket.
- `selfClosingTag.singleline`: Configuration for single-line self closing elements.
- `selfClosingTag.multiline`: Configuration for multi-line self closing elements.

The `selfClosing` is optional, and by default it will use the same configuration as `singleline` and `multiline`, respectively.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.45.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/html-closing-bracket-new-line.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/html-closing-bracket-new-line.ts)
