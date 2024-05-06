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

This rule reports ???.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-svelte-internal: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/no-svelte-internal": ["error", {}]
}
```

-

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-svelte-internal.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-svelte-internal.ts)
