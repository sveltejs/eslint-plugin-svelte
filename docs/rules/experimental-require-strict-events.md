---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/experimental-require-strict-events"
description: "require the strictEvents attribute on <script> tags"
---

# svelte/experimental-require-strict-events

> require the strictEvents attribute on <script> tags

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule enforces the presence of the `strictEvents` attribute on the main `<script>` tag of all components. This attributes enforces typechecking of events dispatched by the component, e.g. making it a typescript error to listen to any non-existent events. Alternatively, the event types may be defined manually by declaring the `$$Events` interface. The `strictEvents` attribute and the `$$Events` interface are experimental and are documented in [svelte RFC #38](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-events).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
/* eslint svelte/experimental-strict-events: "error" */

/* ✓ GOOD */
<script lang="ts" strictEvents>
</script>

<script lang="ts">
  interface $$Events {}
</script>

/* ✗ BAD */
<script lang="ts">
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/experimental-require-strict-events.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/experimental-require-strict-events.ts)
