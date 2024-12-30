---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-object-in-text-mustaches'
description: 'disallow objects in text mustache interpolation'
since: 'v0.5.0'
---

# svelte/no-object-in-text-mustaches

> disallow objects in text mustache interpolation

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule disallows the use of objects in text mustache interpolation.  
When you use an object for text interpolation, it is drawn as `[object Object]`. It's almost always a mistake. You may have written a lot of unnecessary curly braces.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-object-in-text-mustaches: "error" */
</script>

<!-- ✓ GOOD -->
{foo}
<input class="{foo} bar" />
<MyComponent prop={{ foo }} />

<!-- ✗ BAD -->
{{ foo }}
<input class="{{ foo }} bar" />
```

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/no-not-function-handler]

[svelte/no-not-function-handler]: ./no-not-function-handler.md

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-object-in-text-mustaches.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-object-in-text-mustaches.ts)
