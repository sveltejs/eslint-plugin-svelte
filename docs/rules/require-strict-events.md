---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/experimental-require-strict-events"
description: "require the strictEvents attribute on <script> tags"
---

# svelte/experimental-require-strict-events

> require the strictEvents attribute on <script> tags

## :book: Rule Details

This rule enforces the presence of the `strictEvents` attribute on the main `<script>` tag of all components. This attributes enforces typechecking of events dispatched by the component, e.g. making it a typescript error to listen to any non-existent events. The `strictEvents` attribute is experimental and is documented in [svelte RFC #38](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-events).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
/* eslint svelte/experimental-strict-events: "error" */
/* ✓ GOOD */
<script lang="ts" strictEvents>
</script>

/* ✗ BAD */
<script lang="ts">
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.17.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/require-strict-events.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/require-strict-events.ts)
