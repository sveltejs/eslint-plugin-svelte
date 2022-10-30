---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/require-store-callbacks-use-set-param"
description: ""
---

# svelte/require-store-callbacks-use-set-param

> Store callbacks must use `set` param.

## :book: Rule Details

This rule disallows if readable / writable store's setter function doesn't use `set` parameter.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/require-store-callbacks-use-set-param: "error" */
  import { readable, writable, derived } from "svelte/store"

  /** ✓ GOOD  */
  readable(false, (set) => set(true))
  // `set` is unused but this rule doesn't report.
  // For that, please use `no-unused-vars` rule.
  // refer: https://eslint.org/docs/latest/rules/no-unused-vars
  readable(false, (set) => true)

  writable(false, (set) => set(true))
  writable(false, (set) => true)

  derived(a, ($a) => $a * 2)
  derived(
    a,
    ($a, set) => {
      setTimeout(() => set($a), 1000)
    },
    "one moment...",
  )

  /** ✗ BAD  */
  readable(false, () => true)
  readable(false, (foo) => true)

  writable(false, () => true)
  writable(false, (foo) => true)
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > RUN TIME > svelte/store](https://svelte.dev/docs#run-time-svelte-store)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/require-store-callbacks-use-set-param.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/require-store-callbacks-use-set-param.ts)
