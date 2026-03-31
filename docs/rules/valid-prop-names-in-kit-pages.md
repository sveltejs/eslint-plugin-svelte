---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-prop-names-in-kit-pages'
description: 'Invalid prop in SvelteKit route component.'
since: 'v2.12.0'
---

# svelte/valid-prop-names-in-kit-pages

> Invalid prop in SvelteKit route component.

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports unexpected exported variables in `<script>`.<br>
As of SvelteKit v1.0.0-next.405, instead of having multiple props corresponding to the props returned from a load function, page components now have a single data prop.

The valid props depend on the file type:

- `+page.svelte` and `+layout.svelte`: `data`, `errors`, `form`, `params`, `snapshot`
- `+layout.svelte` (Svelte 5): additionally allows `children`
- `+error.svelte` (Svelte 5.53): `error`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-prop-names-in-kit-pages: "error" */
  /** ✓ GOOD */
  export let data;
  export let errors;
  export let form;
  export let params;
  export let snapshot;
  // export let { data } = { data: {} }

  /** ✗ BAD */
  export let foo;
  export let bar;
  export let { baz, qux } = data;
  export let { data: data2 } = { data: {} };
</script>

{foo}, {bar}
```

## :wrench: Options

Nothing. But if use are using not default routes folder, please set configuration according to the [user guide](../user-guide.md#settings-svelte).

## :books: Further Reading

- [SvelteKit Migration Guide (v1.0.0-next.405)](https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/valid-prop-names-in-kit-pages.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/valid-prop-names-in-kit-pages.ts)
