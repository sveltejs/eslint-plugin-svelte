---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-prop-names-in-kit-pages'
description: 'disallow props other than data or errors in SvelteKit page components.'
since: 'v2.12.0'
---

# svelte/valid-prop-names-in-kit-pages

> disallow props other than data or errors in SvelteKit page components.

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

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-prop-names-in-kit-pages: "error" */
  /** ✓ GOOD */
  export let data;
  export let errors;
  export let form;
  export let snapshot;
  // export let { data, errors } = { data: {}, errors: {} }

  /** ✗ BAD */
  export let foo;
  export let bar;
  export let { baz, qux } = data;
  export let { data: data2, errors: errors2 } = { data: {}, errors: {} };
</script>

{foo}, {bar}
```

## :wrench: Options

Nothing. But if use are using not default routes folder, please set configuration according to the [user guide](../user-guide.md#settings-svelte-kit).

## :books: Further Reading

- [SvelteKit Migration Guide (v1.0.0-next.405)](https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/valid-prop-names-in-kit-pages.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/valid-prop-names-in-kit-pages.ts)
