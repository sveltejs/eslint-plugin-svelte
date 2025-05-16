---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-top-level-browser-globals'
description: 'disallow using top-level browser global variables'
since: 'v3.8.0'
---

# svelte/no-top-level-browser-globals

> disallow using top-level browser global variables

## :book: Rule Details

This rule reports top-level browser global variables in Svelte components.
This rule helps prevent the use of browser global variables that can cause errors in SSR (Server Side Rendering).

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-top-level-browser-globals: "error" */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  /* ✓ GOOD */
  onMount(() => {
    const a = localStorage.getItem('myCat');
    console.log(a);
  });

  /* ✓ GOOD */
  if (browser) {
    const a = localStorage.getItem('myCat');
    console.log(a);
  }

  /* ✓ GOOD */
  if (typeof localStorage !== 'undefined') {
    const a = localStorage.getItem('myCat');
    console.log(a);
  }

  /* ✗ BAD */
  const a = localStorage.getItem('myCat');
  console.log(a);
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [`$app/environment` documentation > browser](https://svelte.dev/docs/kit/$app-environment#browser)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.8.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-top-level-browser-globals.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-top-level-browser-globals.ts)
