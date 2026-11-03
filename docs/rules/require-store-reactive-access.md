---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-store-reactive-access'
description: 'disallow to use of the store itself as an operand. Need to use $ prefix or get function.'
since: 'v2.12.0'
---

# svelte/require-store-reactive-access

> disallow to use of the store itself as an operand. Need to use $ prefix or get function.

- :gear: This rule is included in `"plugin:svelte/recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow to use of the store itself as an operand.\
You should access the store value using the `$` prefix or the `get` function.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-store-reactive-access: "error" */
  import { writable, get } from 'svelte/store';
  const storeValue = writable('world');
  const color = writable('red');

  /* ✓ GOOD */
  $: message = `Hello ${$storeValue}`;

  /* ✗ BAD */
  $: message = `Hello ${storeValue}`;
</script>

<!-- ✓ GOOD -->
<p>{$storeValue}</p>
<p>{get(storeValue)}</p>

<p class={$storeValue} />
<p style:color={$color} />

<MyComponent prop="Hello {$storeValue}" />
<MyComponent bind:this={$storeValue} />
<MyComponent --style-props={$storeValue} />
<MyComponent {...$storeValue} />

<!-- ✗ BAD -->
<p>{storeValue}</p>

<p class={storeValue} />
<p style:color />

<MyComponent prop="Hello {storeValue}" />
<MyComponent bind:this={storeValue} />
<MyComponent --style-props={storeValue} />
<MyComponent {...storeValue} />
```

This rule checks the usage of store variables only if the store can be determined within a single file.
However, when using `@typescript-eslint/parser` and full type information, this rule uses the type information to determine if the expression is a store.

<!--eslint-skip-->

```ts
// fileName: my-stores.ts
import { writable } from 'svelte/store';
export const storeValue = writable('hello');
```

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/require-store-reactive-access: "error" */
  import { storeValue } from './my-stores';
</script>

<!-- ✓ GOOD -->
<p>{$storeValue}</p>

<!-- ✗ BAD -->
<p>{storeValue}</p>
```

With type information, this rule also allows the following:

- A store that is also a function (e.g. [melt-ui](https://www.melt-ui.com/) builders are stores and actions) can be called (including tagged templates), and used with `use:`, `transition:`, `in:`, `out:`, `animate:`, `on:`, and event attributes (e.g. `onclick`, Svelte 5 only).
- A store from a function call (e.g. `getContext('key')`), or a variable or parameter initialized with one, can be checked with `??` or `??=` when the fallback is also a store (e.g. `getContext('key') ?? readable(0)`), because the type of the call may not include `undefined`. This does not apply to `writable()`, `readable()`, and `derived()`, since they always return a store.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/require-store-reactive-access: "error" */
  import { getContext } from 'svelte';
  import { type Readable, readable } from 'svelte/store';
  import { createDropdownMenu } from '@melt-ui/svelte';

  const {
    elements: { trigger }
  } = createDropdownMenu();

  /* ✓ GOOD */
  function getStore(): Readable<number> {
    return getContext('key') ?? readable(0);
  }
</script>

<!-- ✓ GOOD -->
<button {...$trigger} use:trigger>open menu</button>
```

The auto-fix adds the `$` prefix only to stores declared at the top level of the component, and not inside the module script (`<script module>` or `<script context="module">`), because Svelte does not allow it there.
It also does not fix the left side of `||=`, `&&=`, and `??=`, because `$store ||= value` sets the store value instead.

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-store-reactive-access.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-store-reactive-access.ts)
