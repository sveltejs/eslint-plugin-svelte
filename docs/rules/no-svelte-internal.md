---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-svelte-internal'
description: 'svelte/internal will be removed in Svelte 6.'
---

# svelte/no-svelte-internal

> svelte/internal will be removed in Svelte 6.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports the use of the deprecated API `svelte/internal` and `svelte/internal/xxx`. `svelte/internal` is deprecated in Svelte 5. And it will be deleted in Svelte 6. These APIs can change in breaking ways at any time without notice.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-svelte-internal: "error" */
  // ✓ GOOD
  import { mount } from 'svelte';

  // ✗ BAD
  import { get_current_component } from 'svelte/internal';
  import { inspect } from 'svelte/internal/client';
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :books: Further Reading

<!--TODO: update here when relevant statements are added in Svelte 5 documentation -->

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-svelte-internal.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-svelte-internal.ts)
