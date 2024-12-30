---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-optimized-style-attribute'
description: 'require style attributes that can be optimized'
since: 'v0.32.0'
---

# svelte/require-optimized-style-attribute

> require style attributes that can be optimized

## :book: Rule Details

This rule reports `style` attributes written in a format that cannot be optimized.

Svelte parses the content written in the style attribute and tries to optimize it. (See [https://github.com/sveltejs/svelte/pull/810](https://github.com/sveltejs/svelte/pull/810))  
If Svelte can be successfully optimized, Svelte can minimize the number of re-renders.

e.g.

template:

```html
<div
  style="
    font-size: 12px;
    color: {color};
    transform: translate({x}px, {y}px);
  "
/>
```

compiled:

```js
div.style.setProperty('font-size', '12px'); // font-size style is not updated once it is initially set.
div.style.setProperty('color', color); // color style is updated only when color variable is updated.
div.style.setProperty('transform', `translate(${x}px, ${y}px)`); // transform style is updated only when x, or y variables are updated.
```

However, if the optimization fails, it will be re-rendered triggered by the update of all variables described in the style attribute.

e.g.

template:

```html
<script>
  $: transformStyle = `transform: translate(${x}px, ${y}px)`;
</script>

<div
  style="
    font-size: 12px;
    color: {color};
    {transformStyle}
  "
/>
```

compiled:

```js
// If any of variables color, x, or y are updated, all styles will be updated.
div.setAttribute('style', `font-size: 12px; color: ${color}; ${/* transformStyle */ ctx[0]}`);
```

Examples:

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-optimized-style-attribute: "error" */
  let color = 'blue';
  let x = 12,
    y = 12;
</script>

<!-- ✓ GOOD -->
<div style="font-size: 12px; color: {color}; transform: translate({x}px, {y}px);" />
<div style:pointer-events={pointerEvents ? null : 'none'} />

<!-- ✗ BAD -->
<div style="font-size: 12px; color: {color}; {transformStyle}" />
<div style={pointerEvents === false ? 'pointer-events:none;' : ''} />

<div style="font-size: 12px; /* comment */ color: {color};" />
<div style="font-size: 12px; {key}: red;" />
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.32.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-optimized-style-attribute.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-optimized-style-attribute.ts)
