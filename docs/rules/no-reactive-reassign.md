---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-reactive-reassign'
description: 'disallow reassigning reactive values'
since: 'v2.27.0'
---

# svelte/no-reactive-reassign

> disallow reassigning reactive values

## :book: Rule Details

This rule aims to prevent unintended behavior caused by modification or reassignment of reactive values.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-reassign: "error" */
  let value = 0;
  $: reactiveValue = value * 2;

  function handleClick() {
    /* ✓ GOOD */
    value++;
    /* ✗ BAD */
    reactiveValue = value * 3;
    reactiveValue++;
  }
</script>

<!-- ✓ GOOD -->
<input type="number" bind:value />
<!-- ✗ BAD -->
<input type="number" bind:value={reactiveValue} />
```

## :wrench: Options

```json
{
  "svelte/no-reactive-reassign": [
    "error",
    {
      "props": true
    }
  ]
}
```

- `props` ... If set to `true`, this rule warns against the modification of reactive value properties. Default is `true`.

### `{ "props": true }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-reassign: ["error", { "props": true }] */
  let value = 0;
  $: reactiveValue = { value: value * 2 };

  function handleClick() {
    /* ✓ GOOD */
    value++;
    /* ✗ BAD */
    reactiveValue.value++;
    reactiveValue = { value: reactiveValue.value + 1 };
  }
</script>

<!-- ✓ GOOD -->
<input type="number" bind:value />
<!-- ✗ BAD -->
<input type="number" bind:value={reactiveValue.value} />
<MyComponent bind:objectValue={reactiveValue} />
```

### `{ "props": false }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-reassign: ["error", { "props": false }] */
  let value = 0;
  $: reactiveValue = { value: value * 2 };

  function handleClick() {
    /* ✓ GOOD */
    value++;
    /* OK */
    reactiveValue.value++;
    /* ✗ BAD */
    reactiveValue = { value: reactiveValue.value + 1 };
  }
</script>

<!-- ✓ GOOD -->
<input type="number" bind:value />
<!-- OK -->
<input type="number" bind:value={reactiveValue.value} />
<!-- ✗ BAD -->
<MyComponent bind:objectValue={reactiveValue} />
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.27.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-reactive-reassign.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-reactive-reassign.ts)
