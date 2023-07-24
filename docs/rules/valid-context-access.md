---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/valid-context-access"
description: "context functions must be called during component initialization."
---

# svelte/valid-context-access

> context functions must be called during component initialization.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports where context API is called except during component initialization.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-context-access: "error" */
  import { setContext, onMount } from "svelte"

  /** ✓ GOOD */
  setContext("answer", 42)
  ;(() => {
    setContext("answer", 42)
  })()

  const init = () => {
    setContext("answer", 42)
  }

  init()

  /** ✗ BAD */
  const update = () => {
    setContext("answer", 42)
  }

  onMount(() => {
    update()
    setContext("answer", 42)
  })

  const update2 = async () => {
    await Promise.resolve()
    setContext("answer", 42)
  }

  ;(async () => {
    await Promise.resolve()
    setContext("answer", 42)
  })()
</script>
```

</ESLintCodeBlock>

- :warning: This rule only inspects Svelte files, not JS / TS files.

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > RUN TIME > svelte > setContext](https://svelte.dev/docs#run-time-svelte-setcontext)
- [Svelte - Docs > RUN TIME > svelte > getContext](https://svelte.dev/docs#run-time-svelte-getContext)
- [Svelte - Docs > RUN TIME > svelte > hasContext](https://svelte.dev/docs#run-time-svelte-hasContext)
- [Svelte - Docs > RUN TIME > svelte > getAllContexts](https://svelte.dev/docs#run-time-svelte-getAllContexts)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/valid-context-access.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/valid-context-access.ts)
