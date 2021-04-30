---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/spaced-html-comment"
description: "enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment"
---

# @ota-meshi/svelte/spaced-html-comment

> enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule will enforce consistency of spacing after the start of a comment `<!--` and before the end of a comment `-->`.

<eslint-code-block fix>

<!--eslint-skip-->

```html
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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/spaced-html-comment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/spaced-html-comment.ts)
