---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-nested-style-tag'
description: 'disallow `<style>` elements nested inside other elements or blocks'
since: 'v3.18.0'
---

# svelte/no-nested-style-tag

> disallow `<style>` elements nested inside other elements or blocks

## :book: Rule Details

Svelte only scopes a single top-level `<style>` element per component. A `<style>` element nested inside another element or block is not scoped, so its rules may leak and cause unintended styles to be applied.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-nested-style-tag: "error" */
</script>

<!-- ✓ GOOD -->
<div>
  <p>hello</p>
</div>

<style>
  p {
    color: red;
  }
</style>
```

```svelte
<script>
  /* eslint svelte/no-nested-style-tag: "error" */
</script>

<!-- ✗ BAD -->
<div>
  <style>
    p {
      color: red;
    }
  </style>
</div>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte docs: nested style elements](https://svelte.dev/docs/svelte/nested-style-elements)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.18.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-nested-style-tag.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-nested-style-tag.ts)
