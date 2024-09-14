---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-each-key'
description: 'require keyed `{#each}` block'
since: 'v2.28.0'
---

# svelte/require-each-key

> require keyed `{#each}` block

## 📖 Rule Details

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

## 🔧 Options

Nothing.

## :couple: Related Rules

- [svelte/valid-each-key](./valid-each-key.md)

## 📚 Further Reading

- [Svelte - Tutorial > 4. Logic / Keyed each blocks](https://svelte.dev/tutorial/keyed-each-blocks)

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v2.28.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-each-key.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-each-key.ts)
