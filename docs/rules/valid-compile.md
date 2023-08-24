---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-compile'
description: 'disallow warnings when compiling.'
since: 'v0.7.0'
---

# svelte/valid-compile

> disallow warnings when compiling.

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule uses Svelte compiler to check the source code.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-compile: "error" */
  let src = 'tutorial/image.gif';
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
  "svelte/valid-compile": [
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
  /* eslint svelte/valid-compile: ["error", { ignoreWarnings: true }] */
  let src = 'tutorial/image.gif';
</script>

<!-- Ignore -->
<img {src} />
```

</ESLintCodeBlock>

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.7.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/valid-compile.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/valid-compile.ts)
