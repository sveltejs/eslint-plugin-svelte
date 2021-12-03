---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/valid-compile"
description: "disallow warnings when compiling."
since: "v0.7.0"
---

# @ota-meshi/svelte/valid-compile

> disallow warnings when compiling.

- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule uses Svelte compiler to check the source code.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/valid-compile: "error" */
  let src = "tutorial/image.gif"
</script>

<!-- ✓ GOOD -->
<img {src} alt="Rick Astley dances." />

<!-- ✗ BAD -->
<img {src} />
```

</ESLintCodeBlock>

Note that we exclude reports for some checks, such as `missing-declaration`, and `dynamic-slot-name`, which you can check with different ESLint rules.

## :wrench: Options

```json
{
  "@ota-meshi/svelte/valid-compile": [
    "error",
    {
      "ignoreWarnings": false
    }
  ]
}
```

- `ignoreWarnings` ... If set to `true`, ignores any warnings other than fatal errors reported by the svelte compiler.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/valid-compile: ["error", { ignoreWarnings: true }] */
  let src = "tutorial/image.gif"
</script>

<!-- Ignore -->
<img {src} />
```

</ESLintCodeBlock>

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.7.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/valid-compile.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/valid-compile.ts)
