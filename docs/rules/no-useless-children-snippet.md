---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-useless-children-snippet'
description: "disallow explicit children snippet where it's not needed"
since: 'v3.0.0-next.9'
---

# svelte/no-useless-children-snippet

> disallow explicit children snippet where it's not needed

## :book: Rule Details

Any content inside component tags that is not a snippet declaration implicitly becomes part of the children snippet. Thus, declaring the children snippet explicitly is only necessary when the snippet has parameters.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-useless-children-snippet: "error" */

  import { Foo } from './Foo.svelte';
</script>

<!-- ✓ GOOD -->
<Foo>
  {#snippet bar()}
    Hello
  {/snippet}
</Foo>

<Foo>
  {#snippet children(val)}
    Hello {val}
  {/snippet}
</Foo>

<Foo>Hello</Foo>

<!-- ✗ BAD -->
<Foo>
  {#snippet children()}
    Hello
  {/snippet}
</Foo>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.0.0-next.9

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-useless-children-snippet.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-useless-children-snippet.ts)
