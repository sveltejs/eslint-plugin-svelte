---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-not-data-props-in-kit-pages"
description: "Disallow props other than data or errors in Svelte Kit page components."
---

# svelte/no-not-data-props-in-kit-pages

> Disallow props other than data or errors in Svelte Kit page components.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports ???.

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

```json
{
  "svelte/no-not-data-props-in-kit-pages": ["error", {}]
}
```

-

## :books: Further Reading

-

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-not-data-props-in-kit-pages.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-not-data-props-in-kit-pages.ts)
