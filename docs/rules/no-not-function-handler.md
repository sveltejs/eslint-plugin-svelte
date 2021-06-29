---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-not-function-handler"
description: "disallow use of not function in event handler"
---

# @ota-meshi/svelte/no-not-function-handler

> disallow use of not function in event handler

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule reports where you used not function value in event handlers.  
If you use a non-function value for the event handler, it event handler will not be called. It's almost always a mistake. You may have written a lot of unnecessary curly braces.

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-not-function-handler: "error" */
  function foo() {
    /*  */
  }
  const bar = 42
</script>

<!-- ✓ GOOD -->
<button on:click={foo} />
<button
  on:click={() => {
    /*  */
  }}
/>

<!-- ✗ BAD -->
<button on:click={{ foo }} />
<button on:click={bar} />
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [@ota-meshi/svelte/no-object-in-text-mustaches]

[@ota-meshi/svelte/no-object-in-text-mustaches]: ./no-object-in-text-mustaches.md

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-not-function-handler.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-not-function-handler.ts)
