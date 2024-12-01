---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-dom-manipulating'
description: 'disallow DOM manipulating'
since: 'v2.13.0'
---

# svelte/no-dom-manipulating

> disallow DOM manipulating

## :book: Rule Details

In general, DOM manipulating should delegate to Svelte runtime. If you manipulate the DOM directly, the Svelte runtime may confuse because there is a difference between the actual DOM and the Svelte runtime's expected DOM.
Therefore this rule reports where you use DOM manipulating function.
We don't recommend but If you intentionally manipulate the DOM, simply you can ignore this ESLint report.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dom-manipulating: "error" */
  let foo, bar, show;

  /* ✓ GOOD */
  const toggle = () => (show = !show);

  /* ✗ BAD */
  const remove = () => foo.remove();
  const update = () => (bar.textContent = 'Update!');
</script>

{#if show}
  <div bind:this={foo}>Foo</div>
{/if}
<div bind:this={bar}>
  {#if show}
    Bar
  {/if}
</div>

<button on:click={() => toggle()}>Click Me (Good)</button>
<button on:click={() => remove()}>Click Me (Bad)</button>
<button on:click={() => update()}>Click Me (Bad)</button>
```

This rule only tracks and checks variables given with `bind:this={}`. In other words, it doesn't track things like function arguments given to `transition:` directives. These functions have been well tested and are often used more carefully.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dom-manipulating: "error" */
  let visible = false;

  function typewriter(node, { speed = 1 }) {
    const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    if (!valid) {
      throw new Error(`This transition only works on elements with a single text node child`);
    }

    const text = node.textContent;
    const duration = text.length / (speed * 0.01);

    return {
      duration,
      tick: (t) => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i); // It does not report.
      }
    };
  }
</script>

<label>
  <input type="checkbox" bind:checked={visible} />
  visible
</label>

{#if visible}
  <p transition:typewriter>The quick brown fox jumps over the lazy dog</p>
{/if}
```

See also <https://svelte.dev/examples/custom-js-transitions>.

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.13.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-dom-manipulating.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-dom-manipulating.ts)
