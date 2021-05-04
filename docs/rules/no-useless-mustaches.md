---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-useless-mustaches"
description: "disallow unnecessary mustache interpolations"
---

# @ota-meshi/svelte/no-useless-mustaches

> disallow unnecessary mustache interpolations

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports mustache interpolation with a string literal value.  
The mustache interpolation with a string literal value can be changed to a static contents.

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-useless-mustaches: "error" */
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

</eslint-code-block>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/no-useless-mustaches": [
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

<eslint-code-block fix>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-useless-mustaches: ["error", { "ignoreIncludesComment": true }] */
</script>

<!-- ✓ GOOD -->
<div data-text={/* comment */ "Lorem ipsum"} />

<!-- ✗ BAD -->
<div data-text={"Lorem ipsum"} />
```

</eslint-code-block>

### `"ignoreStringEscape": true`

<eslint-code-block fix>

```svelte
<!-- ✓ GOOD -->
{"Lorem \n ipsum"}
<div data-text={"Lorem \n ipsum"} />
```

</eslint-code-block>

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-useless-mustaches.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-useless-mustaches.ts)
