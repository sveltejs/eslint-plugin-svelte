---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/spaced-html-comment'
description: 'enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment'
since: 'v0.0.1'
---

# svelte/spaced-html-comment

> enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule will enforce consistency of spacing after the start of a comment `<!--` and before the end of a comment `-->`.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/spaced-html-comment: "error" */
</script>

<!-- ✓ GOOD -->

<!--✗ BAD-->
```

You cannot enforce this style by using [prettier-plugin-svelte]. That is, this rule does not conflict with [prettier-plugin-svelte] and can be used with [prettier-plugin-svelte].

[prettier-plugin-svelte]: https://github.com/sveltejs/prettier-plugin-svelte

## :wrench: Options

```json
{
  "svelte/spaced-html-comment": [
    "error",
    "always" // or "never"
  ]
}
```

- `"always"` ... There must be at least one whitespace after `<!--` and before `-->`.
- `"never"` ... There should be no leading or trailing whitespace. There should be no whitespace following.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/spaced-html-comment.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/spaced-html-comment.ts)
