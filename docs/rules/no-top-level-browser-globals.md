---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-top-level-browser-globals'
description: 'disallow using top-level browser global variables'
---

# svelte/no-top-level-browser-globals

> disallow using top-level browser global variables

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

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
    const a = window.localStorage.getItem('myCat');
    console.log(a);
  });

  /* ✓ GOOD */
  if (browser) {
    const a = window.localStorage.getItem('myCat');
    console.log(a);
  }

  /* ✗ BAD */
  const a = window.localStorage.getItem('myCat');
  console.log(a);
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [`$app/environment` documentation > browser](https://svelte.dev/docs/kit/$app-environment#browser)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-top-level-browser-globals.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-top-level-browser-globals.ts)
