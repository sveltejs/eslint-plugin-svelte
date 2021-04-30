---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/prefer-class-directive"
description: "require class directives instead of ternary expressions"
---

# @ota-meshi/svelte/prefer-class-directive

> require class directives instead of ternary expressions

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to replace a class with ternary operator with the class directive.

<eslint-code-block fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/prefer-class-directive: "error" */
</script>

<!-- ✓ GOOD -->
<button class:selected={current === "foo"}>foo</button>

<!-- ✗ BAD -->
<button class={current === "foo" ? "selected" : ""}>foo</button>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Tutorial > 13. Classes / The class directive](https://svelte.dev/tutorial/classes)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/prefer-class-directive.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/prefer-class-directive.ts)
