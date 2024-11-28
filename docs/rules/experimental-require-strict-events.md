---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/experimental-require-strict-events'
description: 'require the strictEvents attribute on `<script>` tags'
since: 'v2.18.0'
---

# svelte/experimental-require-strict-events

> require the strictEvents attribute on `<script>` tags

## :book: Rule Details

This rule enforces the presence of the `strictEvents` attribute on the main `<script>` tag of all components. This attributes enforces typechecking of events dispatched by the component, e.g. making it a typescript error to listen to any non-existent events. Alternatively, the event types may be defined manually by declaring the `$$Events` interface. The `strictEvents` attribute and the `$$Events` interface are experimental and are documented in [svelte RFC #38](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-events).

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script lang="ts" strictEvents>
  /* eslint svelte/experimental-require-strict-events: "error" */
</script>
```

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script lang="ts">
  /* eslint svelte/experimental-require-strict-events: "error" */
  interface $$Events {}
</script>
```

<!--eslint-skip-->

```svelte
<!-- ✗ BAD -->
<script lang="ts">
  /* eslint svelte/experimental-require-strict-events: "error" */
</script>
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.18.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/experimental-require-strict-events.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/experimental-require-strict-events.ts)
