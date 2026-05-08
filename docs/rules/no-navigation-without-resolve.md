---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-navigation-without-resolve'
description: 'disallow internal navigation (links, `goto()`, `pushState()`, `replaceState()`) without a `resolve()`'
since: 'v3.12.0'
---

# svelte/no-navigation-without-resolve

> disallow internal navigation (links, `goto()`, `pushState()`, `replaceState()`) without a `resolve()`

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule ensures internal navigation via HTML `<a>` tags, SvelteKit's `goto()`, `pushState()` and `replaceState()` uses `resolve()`. `<a>` tags will skip this check when it has an absolute URL or `rel="external"`. For programmatic external navigation, use `window.location`. Enforcing this rule ensures the base path is prefixed and internal links are type-checked.

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState, replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';

  goto(resolve('/foo/'));
  pushState(resolve('/foo/'), {});
  replaceState(resolve('/foo/'), {});

  // shallow routing
  pushState('', {});
  replaceState('', {});
</script>

<a href={resolve('/foo/')}>Click me!</a>
<a href="https://svelte.dev">Click me!</a>
<a href={someURL} rel="external">Click me!</a>
<a href="#top">Click me!</a>
```

```svelte
<!-- ✗ BAD -->
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState, replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';

  goto('/foo');
  goto('/foo' + resolve('/bar'));
  goto(resolve('/foo') + '/bar');

  pushState('/foo', {});
  replaceState('/foo', {});
</script>

<a href="/foo">Click me!</a>
<a href={'/foo'}>Click me!</a>
```

## :wrench: Options

```json
{
  "svelte/no-navigation-without-resolve": [
    "error",
    {
      "ignoreGoto": false,
      "ignoreLinks": false,
      "ignorePushState": false,
      "ignoreReplaceState": false
    }
  ]
}
```

- `ignoreGoto` ... Whether to ignore all `goto()` calls. Default `false`.
- `ignoreLinks` ... Whether to ignore all `<a>` tags. Default `false`.
- `ignorePushState` ... Whether to ignore all `pushState()` calls. Default `false`.
- `ignoreReplaceState` ... Whether to ignore all `replaceState()` calls. Default `false`.

## :books: Further Reading

- [`resolve()` documentation](https://svelte.dev/docs/kit/$app-paths#resolve)
- [Shallow routing](https://svelte.dev/docs/kit/shallow-routing)
- [`goto()` documentation](https://svelte.dev/docs/kit/$app-navigation#goto)
- [`pushState()` documentation](https://svelte.dev/docs/kit/$app-navigation#pushState)
- [`replaceState()` documentation](https://svelte.dev/docs/kit/$app-navigation#replaceState)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-navigation-without-resolve.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-navigation-without-resolve.ts)
