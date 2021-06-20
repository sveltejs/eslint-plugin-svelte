---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/indent"
description: "enforce consistent indentation"
since: "v0.3.0"
---

# @ota-meshi/svelte/indent

> enforce consistent indentation

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces a consistent indentation style in `.svelte`. The default style is 2 spaces.

- This rule checks all tags, also all expressions in directives and mustaches.
- In the expressions, this rule supports ECMAScript 2021 syntaxes. It ignores unknown AST nodes, but it might be confused by non-standard syntaxes.

<eslint-code-block fix>

<!--eslint-skip-->
<!-- prettier-ignore -->

```html
<script>
  /* eslint @ota-meshi/svelte/indent: "error" */
  function click() {}
</script>

<!-- ✓ GOOD -->
<button
  type="button"
  on:click="{click}"
  class="my-button primally"
>
  CLICK ME!
</button>

<!-- ✗ BAD -->
<button
type="button"
    on:click="{click}"
     class="my-button primally"
  >
CLICK ME!
</button>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/indent": [
    "error",
    {
      "indent": 2,
      "ignoredNodes": [],
      "switchCase": 1
    }
  ]
}
```

- `indent` (`number | "tab"`) ... The type of indentation. Default is `2`. If this is a number, it's the number of spaces for one indent. If this is `"tab"`, it uses one tab for one indent.
- `ignoredNodes` ... Can be used to disable indentation checking for any AST node. This accepts an array of [selectors](https://eslint.org/docs/developer-guide/selectors). If an AST node is matched by any of the selectors, the indentation of tokens which are direct children of that node will be ignored. This can be used as an escape hatch to relax the rule if you disagree with the indentation that it enforces for a particular syntactic pattern.
- `switchCase` ... Enforces indentation level for case clauses in switch statements. Default is `1`.

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.3.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/indent.ts)
