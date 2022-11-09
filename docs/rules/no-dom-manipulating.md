---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-dom-manipulating"
description: "disallow DOM manipulating"
---

# svelte/no-dom-manipulating

> disallow DOM manipulating

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

In general, DOM manipulating should delegate to Svelte runtime. If you manipulate the DOM directly, the Svelte runtime may confuse because there is a difference between the actual DOM and the Svelte runtime's expected DOM.
Therefore this rule reports where you use DOM manipulating function.
We don't recommend but If you intentionally manipulate the DOM, simply you can ignore this ESLint report.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dom-manipulating: "error" */
  let div
  let show

  /* ✓ GOOD */
  const toggle = () => (show = !show)

  /* ✗ BAD */
  const remove = () => div.remove()
</script>

{#if show}
  <div bind:this={div}>div</div>
{/if}

<button on:click={() => toggle()}>Click Me (Good)</button>
<button on:click={() => remove()}>Click Me (Bad)</button>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-dom-manipulating.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-dom-manipulating.ts)
