---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/require-event-prefix'
description: 'require component event names to start with "on"'
since: 'v3.6.0'
---

# svelte/require-event-prefix

> require component event names to start with "on"

## :book: Rule Details

Starting with Svelte 5, component events are just component props that are functions and so can be called like any function. Events for HTML elements all have their name begin with "on" (e.g. `onclick`). This rule enforces that all component events (i.e. function props) also begin with "on".

Function props that return a value (e.g. `getHref: (item: Item) => string`) are not events, so this rule ignores them. It only checks return types known to produce no value:

- `void`, `undefined`, or `null`.
- A union of these types, optionally including Promises of these types (e.g. `void | Promise<void>`).
- A Promise or Promise-like of these types, only when `checkAsyncFunctions` is enabled.

The rule ignores `any`, `unknown`, `never`, and unresolved generic return types. If any union member or overload returns a value or an uncertain type, the function is ignored. Otherwise, a synchronous overload is checked even if another overload is asynchronous.

In components with `<script generics="...">`, the parser can erase information about generic return types. To avoid false positives, this rule only checks explicit `void`, `undefined`, or `null` return annotations, unions of them, and `Promise` / `PromiseLike` wrappers around them. Aliases, indexed access types, conditional types, and generic constraints are not followed in these components, even when they ultimately return no value. A callback such as `select: (item: T) => void` is still checked.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/require-event-prefix: "error" */

  /* ✓ GOOD */

  interface Props {
    regularProp: string;
    onclick(): void;
    getHref(item: string): string;
  }

  let { regularProp, onclick, getHref }: Props = $props();
</script>
```

```svelte
<script lang="ts">
  /* eslint svelte/require-event-prefix: "error" */

  /* ✗ BAD */

  interface Props {
    click(): void;
  }

  let { click }: Props = $props();
</script>
```

## :wrench: Options

```json
{
  "svelte/require-event-prefix": [
    "error",
    {
      "checkAsyncFunctions": false
    }
  ]
}
```

- `checkAsyncFunctions` ... Whether to also report asynchronous function properties that return a Promise of `void`, `undefined`, or `null` (e.g. `Promise<void>`). Default `false`.

## :books: Further Reading

- [Svelte docs on events in version 5](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-event-prefix.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-event-prefix.ts)
