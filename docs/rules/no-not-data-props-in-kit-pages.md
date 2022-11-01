---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-not-data-props-in-kit-pages"
description: "disallow props other than data or errors in Svelte Kit page components."
---

# svelte/no-not-data-props-in-kit-pages

> disallow props other than data or errors in Svelte Kit page components.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports unexpected exported variables at `<script>`.<br>
At SvelteKit v1.0.0-next.405, instead of having multiple props corresponding to the props returned from a load function, page components now have a single data prop.

<script>
  const config = {settings: {
    kit: {
      files: {
        routes: "",
      },
    },
  },
  }
</script>

<ESLintCodeBlock config="{config}">

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-not-data-props-in-kit-pages: "error" */
  /** ✓ GOOD */
  export let data
  export let errors
  /** ✗ BAD */
  export let foo
  export let bar
</script>

{foo}, {bar}
```

</ESLintCodeBlock>

## :wrench: Options

Nothing. But if use are using not default routes folder, please set configuration according to the [user guide](../user-guide.md#settings-kit).

## :books: Further Reading

- [SvelteKit Migration Guide (v1.0.0-next.405)](https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-not-data-props-in-kit-pages.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-not-data-props-in-kit-pages.ts)
