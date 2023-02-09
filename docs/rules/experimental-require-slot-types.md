---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/experimental-require-slot-types"
description: "require slot type declaration using the `$$Slots` interface"
---

# svelte/experimental-require-slot-types

> require slot type declaration using the `$$Slots` interface

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule enforces the presence of the `$$Slots` interface if any slots are present in the component. This interface declares all of the used slots and their props and enables typechecking both in the component itself as well as all components that include it.
The  `$$Slots` interface is experimental and is documented in [svelte RFC #38](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-slots).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<!-- eslint svelte/experimental-require-slot-types: "error" -->

<!-- ✓ GOOD -->
<script>
</script>

<b>No slots here!</b>



<script>
  interface $$Slots {
    default: Record<string, never>;
  }
</script>

<slot />




<script lang="ts">
    interface $$Slots {
        default: { prop: boolean; };
    }
</script>

<slot prop={true} />


<script lang="ts">
    interface $$Slots {
        named: Record<string, never>;
    }
</script>

<slot name = "named" />

<!-- ✗ BAD -->
<script>
</script>

<slot />
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/experimental-require-slot-types.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/experimental-require-slot-types.ts)
