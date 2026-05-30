---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-at-const-tags'
description: 'disallow the use of `{@const}` in favor of `{const ...}` declaration tags'
---

# svelte/no-at-const-tags

> disallow the use of `{@const}` in favor of `{const ...}` declaration tags

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports all uses of `{@const ...}`.

In Svelte 5, the `{@const ...}` tag is considered legacy. Use the `{const ...}` declaration tag instead, which can be placed anywhere inside the component.

`{@const ...}` is reactive — its value is re-evaluated when its dependencies change. To preserve that behavior in runes mode, the initializer must be wrapped in `$derived(...)`. The auto-fix does this automatically in runes mode; in legacy (non-runes) mode it simply strips the leading `@`, since `$derived` is not available there.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-at-const-tags: "error" */
  let boxes = $state([
    { width: 10, height: 10 },
    { width: 15, height: 15 }
  ]);
</script>

{#each boxes as box}
  <!-- ✓ GOOD -->
  {const area = $derived(box.width * box.height)}

  <!-- ✗ BAD -->
  {@const label = `${box.width} ⨉ ${box.height}`}

  {label}: {area}
{/each}
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - `{@const ...}`](https://svelte.dev/docs/svelte/@const)
- [Svelte - `{let/const ...}`](https://svelte.dev/docs/svelte/declaration-tags)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-at-const-tags.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-at-const-tags.ts)
