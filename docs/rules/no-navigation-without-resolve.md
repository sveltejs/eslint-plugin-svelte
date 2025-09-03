---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-navigation-without-resolve'
description: 'disallow using navigation (links, goto, pushState, replaceState) without a resolve()'
since: 'v3.12.0'
---

# svelte/no-navigation-without-resolve

> disallow using navigation (links, goto, pushState, replaceState) without a resolve()

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports navigation using HTML `<a>` tags, SvelteKit's `goto()`, `pushState()` and `replaceState()` functions without resolving a relative URL. All four of these may be used for navigation, with `goto()`, `pushState()` and `replaceState()` being intended solely for internal navigation (i.e. not leaving the site), while `<a>` tags may be used for both internal and external navigation. When using any way of internal navigation, the URL must be resolved using SvelteKit's `resolve()`, otherwise the site may break. For programmatic navigation to external URLs, using `window.location` is advised.

This rule checks all 4 navigation options for the presence of the `resolve()` function call, with an exception for `<a>` links to absolute URLs (and fragment URLs), which are assumed to be used for external navigation and so do not require the `resolve()` function, and for shallow outing functions with an empty string as the path, which keeps the current URL.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState, replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';

  // ✓ GOOD
  goto(resolve('/foo/'));

  pushState(resolve('/foo/'), {});
  pushState('', {});

  replaceState(resolve('/foo/'), {});
  replaceState('', {});

  // ✗ BAD
  goto('/foo');
  goto('/foo' + resolve('/bar'));
  goto(resolve('/foo') + '/bar');

  pushState('/foo', {});
  replaceState('/foo', {});
</script>

<!-- ✓ GOOD -->
<a href={resolve('/foo/')}>Click me!</a>
<a href="https://svelte.dev">Click me!</a>

<!-- ✗ BAD -->
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
