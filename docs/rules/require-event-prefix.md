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

Function props that return a value (e.g. `getHref: (item: Item) => string`) are not events, so this rule ignores them. The rule checks a function prop only if it returns:

- No value: `void`, `undefined`, `null`, or `never`.
- `any` or `unknown`, because the rule cannot tell.
- A union of the above, or a union of the above and a Promise of the above (e.g. `void | Promise<void>`).
- A Promise of one of the above (e.g. `Promise<void>`), only when `checkAsyncFunctions` is enabled.

These count as a value:

- A union with a value (e.g. `boolean | void`).
- A return type that uses a generic, like `T` in `<script generics="T">` or `U` in `pick<U>(value: U): U` (e.g. `T`, `keyof T`, `Promise<T>`, or a type alias that uses `T`). This does not apply if the constraint of the generic is `void`, `undefined`, `null`, or a Promise of them (e.g. `V extends void`). A default type of a generic (e.g. `generics="T = void"`) is not used. Generics that do not affect the returned value do not exempt the function: for example, `Row<T>['done']` is checked when `done` is always `void`, as is a conditional type whose branches both return no value.
- `any` or `unknown` that comes from a type parameter of the props type (e.g. `getItem: () => X` with `Props<unknown>`).
- A function with overloads, if one of the overloads returns a value. When all overloads return no value, the function is checked if any overload returns synchronously; otherwise, `checkAsyncFunctions` applies.

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

- `checkAsyncFunctions` ... Whether to also report asynchronous function properties that return a Promise of no value, `any`, or `unknown` (e.g. `Promise<void>`). Default `false`.

## :books: Further Reading

- [Svelte docs on events in version 5](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-event-prefix.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-event-prefix.ts)
