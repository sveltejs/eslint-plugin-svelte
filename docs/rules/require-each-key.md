---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/require-each-key"
description: "require keyed `{#each}` block"
---

# svelte/require-each-key

> require keyed `{#each}` block

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports `{#each}` block without key

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-each-key: "error" */
</script>

<!-- ✓ GOOD -->
{#each things as thing (thing.id)}
  <Thing name={thing.name} />
{/each}

<!-- ✗ BAD -->
{#each things as thing}
  <Thing name={thing.name} />
{/each}
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/valid-each-key](./valid-each-key.md)

## :books: Further Reading

- [Svelte - Tutorial > 4. Logic / Keyed each blocks](https://svelte.dev/tutorial/keyed-each-blocks)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/require-each-key.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/require-each-key.ts)
