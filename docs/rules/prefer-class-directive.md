---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-class-directive'
description: 'require class directives instead of ternary expressions'
since: 'v0.0.1'
---

# svelte/prefer-class-directive

> require class directives instead of ternary expressions

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to replace a class with ternary operator with the class directive.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-class-directive: "error" */
</script>

<!-- ✓ GOOD -->
<button class:selected={current === 'foo'}>foo</button>

<!-- ✗ BAD -->
<button class={current === 'foo' ? 'selected' : ''}>foo</button>
```

</ESLintCodeBlock>

You cannot enforce this style by using [prettier-plugin-svelte]. That is, this rule does not conflict with [prettier-plugin-svelte] and can be used with [prettier-plugin-svelte].

[prettier-plugin-svelte]: https://github.com/sveltejs/prettier-plugin-svelte

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/prefer-style-directive]

[svelte/prefer-style-directive]: ./prefer-style-directive.md

## :books: Further Reading

- [Svelte - Tutorial > 13. Classes / The class directive](https://svelte.dev/tutorial/classes)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/prefer-class-directive.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/prefer-class-directive.ts)
