---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-add-event-listener'
description: 'Warns against the use of `addEventListener`'
since: 'v3.6.0'
---

# svelte/no-add-event-listener

> Warns against the use of `addEventListener`

- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

Svelte relies on event delegation for performance and predictable handler order. Calling `addEventListener` inside a component skips this mechanism. This rule reports any call to `addEventListener` suggests converting to the `on()` helper from `svelte/events`.

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script>
  /* eslint svelte/no-add-event-listener: "error" */
  on(window, 'resize', handler);
</script>
```

<!--eslint-skip-->

```svelte
<!-- ✗ BAD -->
<script>
  /* eslint svelte/no-add-event-listener: "error" */
  window.addEventListener('resize', handler);
</script>
```

## :books: Further reading

- [svelte - event delegation]
- [svelte/events `on` documentation]

[svelte - event delegation]: https://svelte.dev/docs/svelte/basic-markup#Events-Event-delegation
[svelte/events `on` documentation]: https://svelte.dev/docs/svelte/svelte-events#on

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.6.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-add-event-listener.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-add-event-listener.ts)
