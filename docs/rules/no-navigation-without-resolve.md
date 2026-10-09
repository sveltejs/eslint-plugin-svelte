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

This rule also runs on SvelteKit 3. Use `resolve()` from `$app/paths` for internal navigation. SvelteKit 3 removed the `base` export, so the deprecated `no-navigation-without-base` and `no-goto-without-base` rules do not run on Kit 3. See the [official migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3#app-paths).

## :book: Rule Details

This rule ensures internal navigation via HTML `<a>` tags, SvelteKit's `goto()`, `pushState()` and `replaceState()` uses `resolve()`. `<a>` tags will skip this check when it has an absolute URL or `rel="external"`. For programmatic external navigation, use `window.location`. Enforcing this rule ensures the base path is prefixed and internal links are type-checked.

A URL is considered resolved if it starts with a call to `resolve()` (or `asset()`) from `$app/paths`, or with a value of the type `ResolvedPathname` from `$app/types`. The resolved value may be followed by a query string or a fragment, as these don't change the route. Appending anything else, such as another path segment, is reported, as it bypasses the route type-checking of `resolve()`. The URL may be built with concatenation, template literals, variables or ternaries.

The following URLs don't need `resolve()`:

- URLs that start with a query string (e.g. `?page=2`) or a fragment (e.g. `#top`), as they keep the current path.
- Empty URLs in `pushState()` and `replaceState()`, for [shallow routing](https://svelte.dev/docs/kit/shallow-routing).
- Absolute URLs and nullish values in `<a>` tags.

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

  // queries and fragments
  goto(resolve('/foo/') + '?page=2');
  goto(`${resolve('/foo/')}#section`);
  goto(resolve('/foo/') + (searchParams.size ? `?${searchParams}` : ''));
  goto('?page=2');
  replaceState('#top', {});

  // shallow routing
  pushState('', {});
  replaceState('', {});
</script>

<a href={resolve('/foo/')}>Click me!</a>
<a href="{resolve('/foo/')}?page=2">Click me!</a>
<a href="?page=2">Click me!</a>
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
  goto(resolve('/foo') + '/bar?page=2');
  goto(`/foo?${searchParams}`);

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
