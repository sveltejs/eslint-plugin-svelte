---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/indent'
description: 'enforce consistent indentation'
since: 'v0.3.0'
---

# svelte/indent

> enforce consistent indentation

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces a consistent indentation style in `.svelte`. The default style is 2 spaces.

- This rule checks all tags, also all expressions in directives and mustaches.
- In the expressions, this rule supports ECMAScript 2021 syntaxes and some TypeScript syntaxes. It ignores unknown AST nodes, but it might be confused by non-standard syntaxes.

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/indent: "error" */
  function click() {}
</script>

<!-- ✓ GOOD -->
<button
  type="button"
  on:click={click}
  class="my-button primally"
>
  CLICK ME!
</button>

<!-- ✗ BAD -->
<button
type="button"
    on:click={click}
     class="my-button primally"
  >
CLICK ME!
</button>
```

<!-- prettier-ignore-end -->

::: warning Note
This rule only checks `.svelte` files and does not interfere with other `.js` files. Unfortunately the default `indent` rule when turned on will try to lint both, so in order to make them complementary you can use `overrides` setting and disable `indent` rule on `.svelte` files:
:::

```json
{
  "overrides": [
    {
      "files": ["*.svelte"],
      "rules": {
        "svelte/indent": "error",
        "indent": "off"
      }
    }
  ]
}
```

## :wrench: Options

```json
{
  "svelte/indent": [
    "error",
    {
      "indent": 2,
      "ignoredNodes": [],
      "switchCase": 1,
      "alignAttributesVertically": false
    }
  ]
}
```

- `indent` (`number | "tab"`) ... The type of indentation. Default is `2`. If this is a number, it's the number of spaces for one indent. If this is `"tab"`, it uses one tab for one indent.
- `indentScript` (`boolean`) ... If contents within a `<script>` block should be indented a level or not. Default is `true`.
- `ignoredNodes` ... Can be used to disable indentation checking for any AST node. This accepts an array of [selectors](https://eslint.org/docs/developer-guide/selectors). If an AST node is matched by any of the selectors, the indentation of tokens which are direct children of that node will be ignored. This can be used as an escape hatch to relax the rule if you disagree with the indentation that it enforces for a particular syntactic pattern.
- `switchCase` ... Enforces indentation level for case clauses in switch statements. Default is `1`.
- `alignAttributesVertically` ... Condition for whether attributes should be vertically aligned to the first attribute in multiline case or not. Default is `false`

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/indent.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/indent.ts)
