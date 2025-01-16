---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/consistent-selector-style'
description: 'enforce a consistent style for CSS selectors'
since: 'v3.0.0-next.15'
---

# svelte/consistent-selector-style

> enforce a consistent style for CSS selectors

## :book: Rule Details

This rule allows you to set a preferred style for your CSS (& other style language) selectors. In CSS, there is a wide list of options for selecting elements, however, the three most basic types are:

- Selecting by element type (i.e. tag name), such as `a {}`
- Selecting by element ID, such as `#link {}`
- Selecting by element class, such as `.link {}`
  This rule allows you to set a preference for some of these three styles over others. Not all selectors can be used in all situations, however. While class selectors can be used in any situation, ID selectors can only be used to select a single element and type selectors are only applicable when the list of selected elements is the list of all elements of the particular type. To help with this, the rule accepts a list of selector style preferences and reports situations when the given selector can be rewritten using a more preferred style.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/consistent-selector-style: ["error", { style: ["type", "id", "class"] }] */
</script>

<a class="link" id="firstLink">Click me!</a>

<a class="link cross">Click me too!</a>

<b class="bold cross">Text one</b>

<b>Text two</b>

<i id="italic">Text three</i>

<style>
  /* ✓ GOOD */

  a {
    color: green;
  }

  #firstLink {
    color: green;
  }

  .cross {
    color: green;
  }

  /* ✗ BAD */

  /* Can use a type selector */
  .link {
    color: red;
  }

  /* Can use an ID selector (but not a type selector) */
  .bold {
    color: red;
  }

  /* Can use a type selector */
  #italic {
    color: red;
  }
</style>
```

## :wrench: Options

```json
{
  "svelte/consistent-selector-style": [
    "error",
    {
      "checkGlobal": false,
      "style": ["type", "id", "class"]
    }
  ]
}
```

- `checkGlobal` ... Whether to check styles in `:global` blocks as well. Default `false`.
- `style` ... A list of style preferences. Default `["type", "id", "class"]`.

## :books: Further Reading

- [CSS selector documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.0.0-next.15

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/consistent-selector-style.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/consistent-selector-style.ts)
