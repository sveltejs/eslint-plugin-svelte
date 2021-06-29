---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-object-in-text-mustaches"
description: "disallow objects in text mustache interpolation"
since: "v0.5.0"
---

# @ota-meshi/svelte/no-object-in-text-mustaches

> disallow objects in text mustache interpolation

- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule disallows the use of objects in text mustache interpolation.  
When you use an object for text interpolation, it is drawn as `[object Object]`. It's almost always a mistake. You may have written a lot of unnecessary curly braces.

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-object-in-text-mustaches: "error" */
</script>

<!-- ✓ GOOD -->
{foo}
<input class="{foo} bar" />
<MyComponent prop={{ foo }} />

<!-- ✗ BAD -->
{{ foo }}
<input class="{{ foo }} bar" />
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [@ota-meshi/svelte/no-not-function-handler]

[@ota-meshi/svelte/no-not-function-handler]: ./no-not-function-handler.md

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-object-in-text-mustaches.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-object-in-text-mustaches.ts)
