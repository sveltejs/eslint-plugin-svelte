---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/spaced-html-comment"
description: "enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment"
since: "v0.0.1"
---

# @ota-meshi/svelte/spaced-html-comment

> enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule will enforce consistency of spacing after the start of a comment `<!--` and before the end of a comment `-->`.

<eslint-code-block fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/spaced-html-comment: "error" */
</script>

<!-- ✓ GOOD -->

<!--✗ BAD-->
```

</eslint-code-block>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/spaced-html-comment": [
    "error",
    "always" // or "never"
  ]
}
```

- `"always"` ... There must be at least one whitespace after `<!--` and before `-->`.
- `"never"` ... There should be no leading or trailing whitespace.　 There should be no whitespace following.

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/spaced-html-comment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/spaced-html-comment.ts)
