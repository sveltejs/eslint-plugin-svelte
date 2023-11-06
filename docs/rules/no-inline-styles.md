---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-inline-styles'
description: 'disallow attributes and directives that produce inline styles'
---

# svelte/no-inline-styles

> disallow attributes and directives that produce inline styles

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports all attributes and directives that would compile to inline styles. This is mainly useful when adding Content Security Policy to your app, as having inline styles requires the `style-src: 'unsafe-inline'` directive, which is generally discouraged and unsafe.

<ESLintCodeBlock>

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

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/no-inline-styles": [
    "error",
    {
      "allowTransitions": false
    }
  ]
}
```

- `allowTransitions` ... Most svelte transitions (including the built-in ones) use inline styles. However, it is theoretically possible to only use transitions that don't (see this [issue](https://github.com/sveltejs/svelte/issues/6662) about removing inline styles from built-in transitions). This option allows transitions to be used in such cases. Default `false`.

## :books: Further Reading

- [CSP documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-inline-styles.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-inline-styles.ts)
