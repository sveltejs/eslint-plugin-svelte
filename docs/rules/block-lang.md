---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/block-lang'
description: 'disallows the use of languages other than those specified in the configuration for the lang attribute of `<script>` and `<style>` blocks.'
since: 'v2.18.0'
---

# svelte/block-lang

> disallows the use of languages other than those specified in the configuration for the lang attribute of `<script>` and `<style>` blocks.

- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

This rule enforces all svelte components to use the same set of languages for their scripts and styles.

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script lang="ts">
  /* eslint svelte/block-lang: ["error", { "script": "ts" }] */
</script>
```

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script>
  /* eslint svelte/block-lang: ["error", { "script": ["ts", null], "style": "scss" }] */
</script>

<style lang="scss">
</style>
```

<!--eslint-skip-->

```svelte
<!-- ✗ BAD -->
<script>
  /* eslint svelte/block-lang: ["error", { "script": ["ts"] }] */
</script>
```

## :wrench: Options

```json
{
  "svelte/block-lang": [
    "error",
    {
      "enforceScriptPresent": true,
      "enforceStylePresent": false,
      "script": ["ts", null], // a list of languages or null to signify no language specified
      "style": "scss" // same as for script, a single value can be used instead of an array.
    }
  ]
}
```

- `enforceScriptPresent` ... Whether to enforce the presence of a `<script>` block with one of the given languages. This may be useful as for example TypeScript checks some uses of a component if it is defined as being TypeScript. Default `false`.
- `enforceStylePresent` ... Whether to enforce the presence of a `<style>` block with one of the given languages. Default `false`.
- `script` ... A list of languages allowed for the `<script>` block. If `null` is included, no `lang` attribute is also allowed. A plain string or `null` can be used instead of one-item array. Default `null`.
- `style` ... A list of languages allowed for the `<style>` block. If `null` is included, no `lang` attribute is also allowed. A plain string or `null` can be used instead of one-item array. Default `null`.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.18.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/block-lang.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/block-lang.ts)
