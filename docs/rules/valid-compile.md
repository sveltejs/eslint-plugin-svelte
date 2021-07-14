---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/valid-compile"
description: "disallow warnings when compiling."
---

# @ota-meshi/svelte/valid-compile

> disallow warnings when compiling.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule uses Svelte compiler to check the source code.

<eslint-code-block>

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

</eslint-code-block>

Note that we exclude reports for some checks, such as `missing-declaration`, which you can check with different ESLint rules.

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/valid-compile.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/valid-compile.ts)
