---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-not-function-handler"
description: "disallow use of not function in event handler"
since: "v0.5.0"
---

# svelte/no-not-function-handler

> disallow use of not function in event handler

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports where you used not function value in event handlers.  
If you use a non-function value for the event handler, it event handler will not be called. It's almost always a mistake. You may have written a lot of unnecessary curly braces.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-not-function-handler: "error" */
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

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/no-object-in-text-mustaches]

[svelte/no-object-in-text-mustaches]: ./no-object-in-text-mustaches.md

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-not-function-handler.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-not-function-handler.ts)
