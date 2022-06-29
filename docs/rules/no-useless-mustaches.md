---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-useless-mustaches"
description: "disallow unnecessary mustache interpolations"
since: "v0.0.4"
---

# svelte/no-useless-mustaches

> disallow unnecessary mustache interpolations

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports mustache interpolation with a string literal value.  
The mustache interpolation with a string literal value can be changed to a static contents.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-useless-mustaches: "error" */
</script>

<!-- ✓ GOOD -->
Lorem ipsum {foo}
<div data-text="Lorem ipsum" />
<div data-text={bar} />

<!-- ✗ BAD -->
{"Lorem ipsum"}
{"Lorem ipsum"}
{`Lorem ipsum`}
<div data-text={"Lorem ipsum"} />
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/no-useless-mustaches": [
    "error",
    {
      "ignoreIncludesComment": false,
      "ignoreStringEscape": false
    }
  ]
}
```

- `ignoreIncludesComment` ... If `true`, do not report expressions containing comments. default `false`.
- `ignoreStringEscape` ... If `true`, do not report string literals with useful escapes. default `false`.

### `"ignoreIncludesComment": true`

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-useless-mustaches: ["error", { "ignoreIncludesComment": true }] */
</script>

<!-- ✓ GOOD -->
<div data-text={/* comment */ "Lorem ipsum"} />

<!-- ✗ BAD -->
<div data-text={"Lorem ipsum"} />
```

</ESLintCodeBlock>

### `"ignoreStringEscape": true`

<ESLintCodeBlock fix>

```svelte
<!-- ✓ GOOD -->
{"Lorem \n ipsum"}
<div data-text={"Lorem \n ipsum"} />
```

</ESLintCodeBlock>

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.4

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-useless-mustaches.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-useless-mustaches.ts)
