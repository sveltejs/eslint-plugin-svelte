---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-each-key'
description: 'enforce keys to use variables defined in the `{#each}` block'
since: 'v2.28.0'
---

# svelte/valid-each-key

> enforce keys to use variables defined in the `{#each}` block

## :book: Rule Details

This rule reports that `{#each}` block keys does not use the variables which are defined by the `{#each}` block.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-each-key: "error" */

  let things = [
    { id: 1, name: 'apple' },
    { id: 2, name: 'banana' },
    { id: 3, name: 'carrot' },
    { id: 4, name: 'doughnut' },
    { id: 5, name: 'egg' }
  ];
  let foo = 42;
</script>

<!-- ✓ GOOD -->
{#each things as thing (thing.id)}
  <Thing name={thing.name} />
{/each}

<!-- ✗ BAD -->
{#each things as thing (foo)}
  <Thing name={thing.name} />
{/each}
```

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/require-each-key](./require-each-key.md)

## :books: Further Reading

- [Svelte - Tutorial > 4. Logic / Keyed each blocks](https://svelte.dev/tutorial/keyed-each-blocks)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.28.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/valid-each-key.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/valid-each-key.ts)
