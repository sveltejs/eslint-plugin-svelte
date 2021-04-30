---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-dupe-else-if-blocks"
description: "disallow duplicate conditions in `{#if}` / `{:else if}` chains"
since: "v0.0.1"
---

# @ota-meshi/svelte/no-dupe-else-if-blocks

> disallow duplicate conditions in `{#if}` / `{:else if}` chains

- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule disallows duplicate conditions in the same `{#if}` / `{:else if}` chain.

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-dupe-else-if-blocks: "error" */
</script>

<!-- ✓ GOOD -->
{#if a}
  <div>foo</div>
{:else if b}
  <div>bar</div>
{:else if c}
  <div>baz</div>
{/if}

<!-- ✗ BAD -->
{#if a}
  <div>foo</div>
{:else if b}
  <div>bar</div>
{:else if b}
  <div>baz</div>
{/if}

{#if a}
  <div>foo</div>
{:else if b}
  <div>bar</div>
{:else}
  baz
  {#if b}
    <div>qux</div>
  {/if}
{/if}
```

</eslint-code-block>

This rule can also detect some cases where the conditions are not identical, but the branch can never execute due to the logic of `||` and `&&` operators.

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-dupe-else-if-blocks: "error" */
</script>

<!-- ✗ BAD -->
{#if a || b}
  1
{:else if a}
  2
{/if}

{#if a}
  1
{:else if b}
  2
{:else if a || b}
  3
{/if}

{#if a}
  1
{:else if a && b}
  2
{/if}

{#if a && b}
  1
{:else if a && b && c}
  2
{/if}

{#if a || b}
  1
{:else if b && c}
  2
{/if}

{#if a}
  1
{:else if b && c}
  2
{:else if d && ((c && e && b) || a)}
  3
{/if}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related Rules

- [no-dupe-else-if]

[no-dupe-else-if]: https://eslint.org/docs/rules/no-dupe-else-if

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-dupe-else-if-blocks.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-dupe-else-if-blocks.ts)
