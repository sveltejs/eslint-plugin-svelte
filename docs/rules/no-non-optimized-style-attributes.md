---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-non-optimized-style-attributes"
description: "disallow style attributes that cannot be optimized"
since: "v0.31.0"
---

# @ota-meshi/svelte/no-non-optimized-style-attributes

> disallow style attributes that cannot be optimized

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
div.style.setProperty("font-size", "12px") // font-size style is not updated once it is initially set.
div.style.setProperty("color", color) // color style is updated only when color variable is updated.
div.style.setProperty("transform", `translate(${x}px, ${y}px)`) // transform style is updated only when x, or y variables is updated.
```

However, if the optimization fails, it will be re-rendered triggered by the update of all variables described in the style attribute.

e.g.

template:

```html
<script>
  $: transformStyle = `transform: translate(${x}px, ${y}px)`
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
div.setAttribute(
  "style",
  `font-size: 12px; color: ${color}; ${/* transformStyle */ ctx[0]}`,
)
```

Examples:

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-non-optimized-style-attributes: "error" */
  let color = "blue"
  let x = 12,
    y = 12
</script>

<!-- ✓ GOOD -->
<div
  style="font-size: 12px; color: {color}; transform: translate({x}px, {y}px);"
/>
<div style={pointerEvents === false ? "pointer-events:none;" : ""} />

<!-- ✗ BAD -->
<div style="font-size: 12px; color: {color}; {transformStyle}" />
<div style:pointer-events={pointerEvents ? null : "none"} />

<div style="font-size: 12px; /* comment */ color: {color};" />
<div style="font-size: 12px; {key}: red;" />
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.31.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-non-optimized-style-attributes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-non-optimized-style-attributes.ts)
