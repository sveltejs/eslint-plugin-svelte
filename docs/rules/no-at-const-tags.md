---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-at-const-tags'
description: 'disallow the use of `{@const}` in favor of `{const ...}` declaration tags'
since: 'v3.20.0'
---

# svelte/no-at-const-tags

> disallow the use of `{@const}` in favor of `{const ...}` declaration tags

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports uses of `{@const ...}` in runes mode.

`{let/const ...}` declaration tags were introduced in Svelte 5.56.0. This rule only reports and fixes when running on Svelte >=5.56.0.

In Svelte 5, the `{@const ...}` tag is considered legacy. Use the `{const ...}` declaration tag instead, which can be placed anywhere inside the component.

`{@const ...}` is reactive — its value is re-evaluated when its dependencies change. To preserve that behavior, the initializer must be wrapped in `$derived(...)`, and the auto-fix does this automatically.

This rule does nothing in non-runes mode: it neither reports nor fixes there. `$derived(...)` is unavailable outside runes mode, so the reactive behavior of `{@const ...}` cannot be preserved when converting to a `{const ...}` declaration tag.

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

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.20.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-at-const-tags.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-at-const-tags.ts)
