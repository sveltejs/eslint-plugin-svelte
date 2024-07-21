---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-class-directive'
description: 'require class directives instead of ternary expressions'
since: 'v0.0.1'
---

# svelte/prefer-class-directive

> require class directives instead of ternary expressions

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule aims to replace a class with ternary operator with the class directive.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-class-directive: ["error", {"prefer": "empty"}] */
  const selected = true;
</script>

<!-- ✓ GOOD -->
<button class:selected>foo</button>
<button class:selected={current === 'foo'}>foo</button>

<!-- ✗ BAD -->
<button class={selected ? 'selected' : ''}>foo</button>
<button class={current === 'foo' ? 'selected' : ''}>foo</button>
```

</ESLintCodeBlock>

You cannot enforce this style by using [prettier-plugin-svelte]. That is, this rule does not conflict with [prettier-plugin-svelte] and can be used with [prettier-plugin-svelte].

[prettier-plugin-svelte]: https://github.com/sveltejs/prettier-plugin-svelte

## 🔧 Options

```json
{
  "svelte/html-quotes": [
    "error",
    {
      "prefer": "empty" // or "always"
    }
  ]
}
```

- `prefer` ... Whether to apply this rule always or just when there's an empty string. Default is `"empty"`.
  - `"empty"` ... Requires class directives only if one of the strings is empty.
  - `"always"` ... Requires class directives always rather than interpolation.

## :couple: Related Rules

- [svelte/prefer-style-directive]

[svelte/prefer-style-directive]: ./prefer-style-directive.md

## 📚 Further Reading

- [Svelte - Tutorial > 13. Classes / The class directive](https://svelte.dev/tutorial/classes)

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.0.1

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-class-directive.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-class-directive.ts)
