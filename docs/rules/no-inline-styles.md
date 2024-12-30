---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-inline-styles'
description: 'disallow attributes and directives that produce inline styles'
since: 'v2.35.0'
---

# svelte/no-inline-styles

> disallow attributes and directives that produce inline styles

## :book: Rule Details

This rule reports all attributes and directives that would compile to inline styles. This is mainly useful when adding Content Security Policy to your app, as having inline styles requires the `style-src: 'unsafe-inline'` directive, which is generally discouraged and unsafe.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-inline-styles: "error" */

  import { fade } from 'svelte/transition';

  export let classTwo;
  export let blockDisplay;
</script>

<!-- ✓ GOOD -->
<span class="one">Hello World!</span>

<span class:two={classTwo}>Hello World!</span>

<!-- ✗ BAD -->
<span style="display: block;">Hello World!</span>

<span style:display={blockDisplay ? 'block' : 'inline'}>Hello World!</span>

<span transition:fade>Hello World!</span>
```

## :wrench: Options

```json
{
  "svelte/no-inline-styles": [
    "error",
    {
      "allowTransitions": true
    }
  ]
}
```

- `allowTransitions` ... Some svelte transitions (including the built-in ones in Svelte 4 and older) use inline styles. This option allows transitions to be used. Default `true`.

## :books: Further Reading

- [CSP documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.35.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-inline-styles.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-inline-styles.ts)
