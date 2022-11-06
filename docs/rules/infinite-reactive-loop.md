---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/infinite-reactive-loop"
description: "Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent."
---

# svelte/infinite-reactive-loop

> Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

Svelte runtime prevents calling the same reactive statement twice in a microtask.<br/>
But between different microtask, it doesn't prevent.<br/>
This rule reports those possible infinite loop.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/infinite-reactive-loop: "error" */
  import { count } from "./store.js"
  import { tick } from "svelte"
  let a = 0

  // ✓ GOOD
  $: if (a < 10) {
    a += 1
    $count += 1
  }

  $: (async () => {
    // You can update a state in the same micro task.
    a += 1
    $count += 1
    await new Promise((resolve) => setTimeout(resolve, 100))
  })()

  const doSomething = async () => {
    await fetchFromServer()
  }

  $: (async () => {
    await doSomething()
  })()

  // ✗ BAD
  $: (async () => {
    await doSomething()
    a += 1
    $count += 1
  })()

  $: Promise.resolve().then(() => {
    a += 1
    $count += 1
  })

  $: setTimeout(() => {
    a = a + 1
    $count += 1
  }, 100)

  const doSomething2_1 = () => {
    a += 1
  }

  const doSomething2 = async () => {
    a += 1
    await fetchFromServer()
    doSomething2_1()
  }

  $: (async () => {
    console.log(a)
    await doSomething2()
  })()

  const doSomething3 = () => {
    a += 1
    $count += 1
  }

  $: (async () => {
    console.log(a, $count)
    tick(() => doSomething3())
  })()
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > COMPONENT FORMAT > 3. $: marks a statement as reactive](https://svelte.dev/docs#component-format-script-3-$-marks-a-statement-as-reactive)
- [Svelte - Docs > COMPONENT FORMAT > 4. Prefix stores with $ to access their values](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/infinite-reactive-loop.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/infinite-reactive-loop.ts)
