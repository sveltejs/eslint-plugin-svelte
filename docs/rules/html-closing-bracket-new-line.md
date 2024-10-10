---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/html-closing-bracket-new-line'
description: "require or disallow a line break before tag's closing brackets"
---

# svelte/html-closing-bracket-new-line

> require or disallow a line break before tag's closing brackets

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/brackets-same-line: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/brackets-same-line": ["error", {}]
}
```

-

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/html-closing-bracket-new-line.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/html-closing-bracket-new-line.ts)
