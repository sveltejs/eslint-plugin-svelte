---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/valid-each-key"
description: "enforce keys to use variables defined in the `{#each}` block"
---

# svelte/valid-each-key

> enforce keys to use variables defined in the `{#each}` block

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports that `{#each}` block keys does not use the variables which are defined by the `{#each}` block.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-each-key: "error" */

  let things = [
    { id: 1, name: "apple" },
    { id: 2, name: "banana" },
    { id: 3, name: "carrot" },
    { id: 4, name: "doughnut" },
    { id: 5, name: "egg" },
  ]
  let foo = 42
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

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/require-each-key](./require-each-key.md)

## :books: Further Reading

- [Svelte - Tutorial > 4. Logic / Keyed each blocks](https://svelte.dev/tutorial/keyed-each-blocks)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/valid-each-key.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/valid-each-key.ts)
