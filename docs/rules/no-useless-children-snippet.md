---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-useless-children-snippet'
description: "disallow explicit children snippet where it's not needed"
---

# svelte/no-useless-children-snippet

> disallow explicit children snippet where it's not needed

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

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

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-useless-children-snippet.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-useless-children-snippet.ts)
