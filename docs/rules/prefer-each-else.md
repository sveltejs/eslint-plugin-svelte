---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-each-else'
description: 'require `{:else}` blocks in `{#each}` blocks instead of checking the length in `{#if}` blocks'
---

# svelte/prefer-each-else

> require `{:else}` blocks in `{#each}` blocks instead of checking the length in `{#if}` blocks

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports `{#if}` blocks that check the length of a list only to render an `{#each}` block over it or a fallback when it is empty.

An [`{:else}` block](https://svelte.dev/docs/svelte/each#Else-blocks) in the `{#each}` block is rendered when the list is empty, so it does the same thing with less code and less nesting.

The rule only reports `{#if}` blocks where the `{#each}` block is the only content of its branch, the other branch is an `{:else}` block (not `{:else if}`), and the condition only checks the length of the exact expression that the `{#each}` block iterates over:

- `items.length`, `items.length > 0`, `items.length !== 0`, `items.length >= 1`
- `!items.length`, `items.length === 0`, `items.length < 1`, `items.length <= 0`

In Svelte 5, an `{#each}` block over `null` or `undefined` renders its `{:else}` block, so optional chaining such as `items?.length` and `!items?.length` is reported as well. Conditions that treat `null` or `undefined` differently from an empty list, such as `items?.length !== 0`, are not reported. In Svelte 3 and 4, `{#each}` blocks throw an error for `null` or `undefined`, so conditions using optional chaining are never reported.

This rule does not fix the code automatically, because moving the content out of the `{#if}` block can change when transitions inside the `{#each}` block play.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/prefer-each-else: "error" */
  let { items } = $props();
</script>

<!-- ✓ GOOD -->
{#each items as item}
  <p>{item}</p>
{:else}
  <p>No items</p>
{/each}

<!-- ✗ BAD -->
{#if items.length}
  {#each items as item}
    <p>{item}</p>
  {/each}
{:else}
  <p>No items</p>
{/if}

{#if items.length > 0}
  {#each items as item}
    <p>{item}</p>
  {/each}
{:else}
  <p>No items</p>
{/if}

{#if items.length === 0}
  <p>No items</p>
{:else}
  {#each items as item}
    <p>{item}</p>
  {/each}
{/if}

{#if !items?.length}
  <p>No items</p>
{:else}
  {#each items as item}
    <p>{item}</p>
  {/each}
{/if}
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > `{#each ...}` > Else blocks](https://svelte.dev/docs/svelte/each#Else-blocks)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/prefer-each-else.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/prefer-each-else.ts)
