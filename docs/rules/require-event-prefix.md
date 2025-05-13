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

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/require-event-prefix: "error" */

  /* ✓ GOOD */

  interface Props {
    regularProp: string;
    onclick(): void;
  }

  let { regularProp, onclick }: Props = $props();
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

- `checkAsyncFunctions` ... Whether to also report asychronous function properties. Default `false`.

## :books: Further Reading

- [Svelte docs on events in version 5](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/require-event-prefix.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/require-event-prefix.ts)
