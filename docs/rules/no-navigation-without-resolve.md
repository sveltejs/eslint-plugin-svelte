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
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

This rule runs on SvelteKit 2.26 or later (where `resolve()` exists) and on SvelteKit 3. SvelteKit 3 removed the `base` export, so the deprecated `no-navigation-without-base` and `no-goto-without-base` rules do not run on Kit 3. See the [official migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3#app-paths).

## :book: Rule Details

When your app sets [`paths.base`](https://svelte.dev/docs/kit/configuration#paths), every internal URL must include it. `resolve()` from `$app/paths` adds it for you. A URL like `/about` skips the base path and leads to a 404 page.

This rule reports URLs that are **known** to skip the base path or to break `resolve()`. It only reports what it can prove. If it cannot tell what a value is (for example a prop, `data` from a `load` function, or an import), it does not report it. Use the `strict` option if you want to report those values too.

The rule checks these places:

- `href` of `<a>` (including SVG `<a>` and `xlink:href`) and `<area>`
- `action` of `<form>` and `formaction` of `<button>` / `<input>`
- the URL argument of `goto()`, `pushState()`, `replaceState()` and `preloadData()`
- the arguments of `preloadCode()` on SvelteKit 2 (on SvelteKit 3 it takes a route ID)

It follows values through string concatenation, template literals, `? :`, `||`, `??`, local variables (including reassignments), `$state()`, `$derived()`, default values of `$props()`, arrays, objects and `{#each}` blocks. With TypeScript type information, it also uses string literal types and `ResolvedPathname`.

The rule reports:

- **Root-relative URLs** like `/about`. Use `resolve('/about')`. For files in `static`, use `asset()`.
- **Relative URLs** like `about`, `./about` and `../about`. They depend on the current URL (and its trailing slash) and can point outside the base path. You can allow them with `allowRelativePaths`.
- **Anything before `resolve()`**, like `` `${origin}${resolve('/about')}` ``. During server rendering, `resolve()` can return a relative path such as `./about`, so the result breaks.
- **A path after `resolve()`**, like `resolve('/blog') + '/' + slug`. Pass the whole path to `resolve()` instead: `resolve('/blog/[slug]', { slug })`. A query (`?…`) or a hash (`#…`) after `resolve()` is fine.
- **External URLs in `goto()`, `pushState()`, `replaceState()` and `preloadData()`**. They cannot navigate to other sites. Use `window.location` or a link.

These are always fine:

- external URLs in links, like `https://svelte.dev`, `//cdn.example.com` and `mailto:…`
- `''`, `?query` and `#hash`
- links with the `external` token in `rel` (the URL is served by another app on the same origin)
- `page.url` from `$app/state`, and the deprecated `base` / `assets` from `$app/paths`

`data-sveltekit-reload`, `target` and `download` do not exempt a link: the base path is still needed.

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState, replaceState } from '$app/navigation';
  import { resolve, asset } from '$app/paths';
  import { page } from '$app/state';

  let { href } = $props();

  goto(resolve('/foo/'));
  goto(resolve('/blog/[slug]', { slug: 'hello' }));
  goto(resolve('/search') + '?q=svelte');
  goto(href); // unknown value: not reported by default
  goto(new URL(resolve('/foo'), page.url));

  // shallow routing
  pushState('', {});
  replaceState('?tab=info', {});
</script>

<a href={resolve('/foo/')}>Click me!</a>
<a href="{resolve('/search')}?q={query}">Click me!</a>
<a href={asset('/manual.pdf')}>Click me!</a>
<a href="https://svelte.dev">Click me!</a>
<a href="/other-app" rel="external">Click me!</a>
<a href="#top">Click me!</a>
<a {href}>Click me!</a>
<form method="POST" action="?/login"></form>
```

```svelte
<!-- ✗ BAD -->
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { slug, href = '/fallback' } = $props();

  goto('/foo');
  goto(`/blog/${slug}`);
  goto('/foo' + resolve('/bar'));
  goto(resolve('/blog') + '/' + slug);
  goto('https://svelte.dev');
  pushState('/foo', {});
</script>

<a href="/foo">Click me!</a>
<a href="./foo">Click me!</a>
<a href="/foo" data-sveltekit-reload>Click me!</a>
<a href="{page.url.origin}{resolve('/foo')}">Click me!</a>
<a {href}>Click me!</a>
<form action="/login"></form>
```

### TypeScript

With type information, string literal types are checked too:

<!--eslint-skip-->

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ResolvedPathname } from '$app/types';

  let { to, resolved }: { to: '/a' | '/b'; resolved: ResolvedPathname } = $props();

  goto(to); // ✗ BAD
  goto(resolved); // ✓ GOOD
</script>
```

If you really need to build a URL by hand (for example a path that has no route, handled in a hook), cast it with `as ResolvedPathname` or use an `eslint-disable` comment.

### `.ts` / `.js` files

The `recommended` config only applies to `.svelte`, `.svelte.js` and `.svelte.ts` files. To also check `goto()` calls in other files, enable the rule for them:

```js
// eslint.config.js
export default [
  // ...
  {
    files: ['src/**/*.js', 'src/**/*.ts'],
    rules: {
      'svelte/no-navigation-without-resolve': 'error'
    }
  }
];
```

### Limitations

- The rule does not know what imported functions return. For example, a helper that builds a localized URL without the base path is not reported. Use `strict` if you need to catch those.
- The rule does not know your router type. On SvelteKit 3 with `router.type: 'hash'`, `goto('#foo')` is not reported, although it does not work there.
- `redirect()` is not checked yet.

## :wrench: Options

```json
{
  "svelte/no-navigation-without-resolve": [
    "error",
    {
      "strict": false,
      "allowRelativePaths": false
    }
  ]
}
```

- `strict` ... Also report every URL that the rule cannot prove to be resolved, such as props, `data`, imports and function results, and values added after `resolve()` that are not known to start with `?` or `#`. Values typed as `ResolvedPathname` (or `URL & { pathname: ResolvedPathname }`) and `page.url` are accepted. Default `false`.
- `allowRelativePaths` ... Allow relative URLs such as `foo`, `./foo` and `../foo`. Default `false`.

The following options are **deprecated** and will be removed in the next major version. The rule no longer reports values it cannot understand, so they are rarely needed. Use `eslint-disable` comments instead.

- `ignoreGoto` ... Whether to ignore all `goto()` calls. Default `false`.
- `ignoreLinks` ... Whether to ignore all `<a>` and `<area>` tags. Default `false`.
- `ignorePushState` ... Whether to ignore all `pushState()` calls. Default `false`.
- `ignoreReplaceState` ... Whether to ignore all `replaceState()` calls. Default `false`.

## :books: Further Reading

- [`resolve()` documentation](https://svelte.dev/docs/kit/$app-paths#resolve)
- [Shallow routing](https://svelte.dev/docs/kit/shallow-routing)
- [`goto()` documentation](https://svelte.dev/docs/kit/$app-navigation#goto)
- [`pushState()` documentation](https://svelte.dev/docs/kit/$app-navigation#pushState)
- [`replaceState()` documentation](https://svelte.dev/docs/kit/$app-navigation#replaceState)
- [`paths` configuration](https://svelte.dev/docs/kit/configuration#paths)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.12.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-navigation-without-resolve.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-navigation-without-resolve.ts)
