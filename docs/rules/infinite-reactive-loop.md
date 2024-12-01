---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/infinite-reactive-loop'
description: "Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent."
since: 'v2.16.0'
---

# svelte/infinite-reactive-loop

> Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent.

## :book: Rule Details

Svelte runtime prevents calling the same reactive statement twice in a microtask.<br/>
But between different microtask, it doesn't prevent.<br/>
This rule reports those possible infinite loop.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/infinite-reactive-loop: "error" */
  import { count } from './store.js';
  import { tick } from 'svelte';
  let a = 0;

  // ✓ GOOD
  $: if (a < 10) {
    a += 1;
    $count += 1;
  }

  $: (async () => {
    // You can update a state in the same micro task.
    a += 1;
    $count += 1;
    await new Promise((resolve) => setTimeout(resolve, 100));
  })();

  $: (async () => {
    await doSomething_ok();
  })();

  const doSomething_ok = async () => {
    await fetchFromServer();
    // You can update a state even in different microtask
    // if you don't refer the state in reactive statement.
    a += 1;
  };

  // ✗ BAD
  $: (async () => {
    await doSomething();
    // Do not update a state in different micro task.
    a += 1;
    $count += 1;
  })();

  $: tick(() => {
    a = a + 1;
    $count += 1;
  });

  $: (async () => {
    console.log(a);
    // This rule checks caller function recursively.
    await doSomething_ng_1();
  })();

  const doSomething_ng_1 = async () => {
    a += 1;
    await fetchFromServer();
    doSomething_ng_2();
  };

  const doSomething_ng_2 = () => {
    a += 1;
  };
</script>
```

## :wrench: Options

Nothing.

## :books: Further Reading

- [Svelte - Docs > COMPONENT FORMAT > 3. $: marks a statement as reactive](https://svelte.dev/docs#component-format-script-3-$-marks-a-statement-as-reactive)
- [Svelte - Docs > COMPONENT FORMAT > 4. Prefix stores with $ to access their values](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.16.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/infinite-reactive-loop.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/infinite-reactive-loop.ts)
