---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-svelte-internal'
description: 'svelte/internal will be removed in Svelte 6.'
since: 'v2.39.0'
---

# svelte/no-svelte-internal

> svelte/internal will be removed in Svelte 6.

## :book: Rule Details

This rule reports the use of the deprecated API `svelte/internal` and `svelte/internal/xxx`. `svelte/internal` is deprecated in Svelte 5. And it will be deleted in Svelte 6. These APIs can change in breaking ways at any time without notice.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-svelte-internal: "error" */
  // ✓ GOOD
  import { mount } from 'svelte';

  // ✗ BAD
  import { get_current_component } from 'svelte/internal';
  import { inspect } from 'svelte/internal/client';
  import('svelte/internal');
  import('svelte/internal/disclose-version');

  export * from 'svelte/internal';
  export { listen } from 'svelte/internal';
  export * from 'svelte/internal/server';
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

<!--TODO: update here when relevant statements are added in Svelte 5 documentation -->

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.39.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-svelte-internal.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-svelte-internal.ts)
