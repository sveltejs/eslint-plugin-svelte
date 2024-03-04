---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-goto-without-base'
description: 'disallow using goto() without the base path'
since: 'v2.36.0-next.9'
---

# svelte/no-goto-without-base

> disallow using goto() without the base path

## :book: Rule Details

This rule reports navigation using SvelteKit's `goto()` function without prefixing a relative URL with the base path. If a non-prefixed relative URL is used for navigation, the `goto` function navigates away from the base path, which is usually not what you wanted to do (for external URLs, `window.location = url` should be used instead).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-goto-without-base: "error" */

  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { base as baseAlias } from '$app/paths';

  // ✓ GOOD
  goto(base + '/foo/');
  goto(`${base}/foo/`);

  goto(baseAlias + '/foo/');
  goto(`${baseAlias}/foo/`);

  goto('https://localhost/foo/');

  // ✗ BAD
  goto('/foo');

  goto('/foo/' + base);
  goto(`/foo/${base}`);
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :books: Further Reading

- [`goto()` documentation](https://kit.svelte.dev/docs/modules#$app-navigation-goto)
- [`base` documentation](https://kit.svelte.dev/docs/modules#$app-paths-base)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.36.0-next.9

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-goto-without-base.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-goto-without-base.ts)
