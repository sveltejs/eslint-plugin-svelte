---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/comment-directive'
description: 'support comment-directives in HTML template'
since: 'v0.0.13'
---

# svelte/comment-directive

> support comment-directives in HTML template

- :gear: This rule is included in `"plugin:svelte/base"` and `"plugin:svelte/recommended"`.

Sole purpose of this rule is to provide `eslint-disable` functionality in the template HTML.
It supports usage of the following comments:

- `eslint-disable`
- `eslint-enable`
- `eslint-disable-line`
- `eslint-disable-next-line`

::: warning Note
We can't write HTML comments in tags.
:::

## :book: Rule Details

ESLint doesn't provide any API to enhance `eslint-disable` functionality and ESLint rules cannot affect other rules. But ESLint provides [processors API](https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins).

This rule sends all `eslint-disable`-like comments to the post-process of the `.svelte` file processor, then the post-process removes the reported errors in disabled areas.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/comment-directive: "error", no-undef: "error" */
</script>

<!-- eslint-disable-next-line no-undef -->
<UndefComponent />
```

The `eslint-disable`-like comments can include descriptions to explain why the comment is necessary. The description must occur after the directive and is separated from the directive by two or more consecutive `-` characters. For example:

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/comment-directive: "error", no-undef: "error" */
</script>

<!-- eslint-disable-next-line no-undef -- Here's a description about why this disabling is necessary. -->
<UndefComponent />
```

## :wrench: Options

```json
{
  "svelte/comment-directive": [
    "error",
    {
      "reportUnusedDisableDirectives": false
    }
  ]
}
```

- `reportUnusedDisableDirectives` ... If `true`, to report unused `eslint-disable` HTML comments. default `false`

### `{ "reportUnusedDisableDirectives": true }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/comment-directive: ["error", { "reportUnusedDisableDirectives": true }], no-undef: "error" */
  import DefinedComponent from './DefinedComponent.svelte';
</script>

<!-- ✓ GOOD -->
<!-- eslint-disable-next-line no-undef -->
<UndefComponent />

<!-- ✗ BAD -->
<!-- eslint-disable-next-line no-undef -->
<DefinedComponent />
```

## :books: Further Reading

- [Disabling rules with inline comments]

[disabling rules with inline comments]: https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.13

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/comment-directive.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/comment-directive.ts)
