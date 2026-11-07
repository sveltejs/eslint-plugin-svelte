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

This rule runs on SvelteKit 2.26 or later, where `resolve()` exists. SvelteKit 3 removed the `base` export, so the deprecated `no-navigation-without-base` and `no-goto-without-base` rules do not run on Kit 3. See the [official migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3#app-paths).

## :book: Rule Details

When your app sets [`paths.base`](https://svelte.dev/docs/kit/configuration#paths), internal destinations must resolve within that base path. `resolve()` from `$app/paths` adds it for you. A hard-coded URL like `/about` does not adapt when the base path changes and may lead to a 404 page.

This rule encourages base-path-aware internal navigation. It reports statically identifiable URL patterns that do not adapt to the base path or bypass `resolve()`. This is a policy check, not proof that a URL is broken: the rule does not know your deployment origin, routing configuration, or whether a hard-coded path intentionally targets another application. If it cannot tell what a value is (for example a prop, `data` from a `load` function, or a function result), it does not report it. Use the `strict` option if you want to report those values too. With type information, a value with a declared string literal type (for example a typed prop or an imported `as const` constant) is known, so it can be reported.

The rule checks these places:

- `href` of `<a>` (including SVG `<a>` and `xlink:href`) and `<area>`
- `action` of `<form>` and `formaction` of `<button>` / `<input>`
- the URL argument of `goto()`, `pushState()`, `replaceState()` and `preloadData()`
- the argument of `preloadCode()` on SvelteKit 2 (on SvelteKit 3 it takes a route ID, so passing a resolved URL is reported)

It follows values through string concatenation, template literals, `? :`, `||`, `??`, local variables (every value assigned to them, in any order), `$state()`, `$derived()`, default values of `$props()`, arrays, objects and `{#each}` blocks. With TypeScript type information, it also uses declared string literal types and `ResolvedPathname`.

The rule reports:

- **Root-relative URLs** like `/about`. Use `resolve('/about')`. For files in `static`, use `asset()`.
- **Relative URLs** like `about`, `./about` and `../about`. They depend on the current URL (and its trailing slash) and can point outside the base path. You can allow them with `allowRelativePaths` (except SvelteKit 2 `preloadCode()`, which requires a root-relative pathname).
- **Anything before `resolve()`**, like `` `${page.url.origin}${resolve('/about')}` ``. During server rendering, `resolve()` can return a relative path such as `./about`, so the result breaks. `` `${base}${resolve('/about')}` `` adds the base path twice. An unknown value before `resolve()` (which may be empty) is reported only with `strict`.
- **A path after `resolve()`**, like `resolve('/blog') + '/' + slug`. It bypasses the route type checks of `resolve()`, and `resolve('/') + '/about'` even becomes `//about` (another host) when there is no base path. Pass the whole path to `resolve()` instead: `resolve('/blog/[slug]', { slug })`. A query (`?…`) or a hash (`#…`) after `resolve()` is fine. A path after `asset()` is fine too.
- **Non-HTTP(S) URLs in navigation calls**, such as `goto('mailto:hello@example.com')`. HTTP(S) and protocol-relative URLs may be same-origin, so they are skipped by default and reported as unverifiable with `strict`. SvelteKit 2 `preloadCode()` requires a pathname, so absolute URLs are reported there.

For URL-taking sinks (excluding `preloadCode()`), these are accepted:

- external URLs in links, like `https://svelte.dev`, `//cdn.example.com` and `mailto:…`
- `''`, `?query` and `#hash`
- links and forms with the `external` token in `rel` (the URL is served by another app on the same origin). When `rel` is not known (e.g. `rel={rel}`), the element is not checked unless `strict` is on.
- `page.url` from `$app/state` (or `$page.url` from `$app/stores`), and the deprecated `base` / `assets` from `$app/paths`

`data-sveltekit-reload`, `target` and `download` do not exempt a link: changing how navigation happens does not make an internal URL adapt to the base path. This also applies to `<area>` and SVG links, regardless of whether the client router intercepts them.

For forms, the exemption for `rel="external"` also applies to submit controls owned by that form (including a statically known `form="id"`). This follows the [HTML meaning of `external`](https://html.spec.whatwg.org/multipage/links.html#link-type-external); it is not a guarantee that SvelteKit will bypass its router or `use:enhance`. Use `data-sveltekit-reload` when a GET form must bypass the router, and do not use `use:enhance` for an endpoint that is not a SvelteKit form action. If a submit control intentionally targets a different application from its form, use an ESLint disable comment on that control.

Non-submit buttons/inputs and submissions whose effective method is `dialog` are skipped. A submit control's `formmethod` overrides its owner's `method`. Empty actions and named actions such as `?/login` remain valid; an action on another route still needs a base-aware path.

See SvelteKit's [link options](https://svelte.dev/docs/kit/link-options), [form actions](https://svelte.dev/docs/kit/form-actions), and [`$app/navigation`](https://svelte.dev/docs/kit/$app-navigation). `preloadCode()` takes one pathname on Kit 2 and one route ID on Kit 3; extra arguments are not URL sinks.

<!--eslint-skip-->

```svelte
<!-- ✓ GOOD -->
<script>
  /* eslint svelte/no-navigation-without-resolve: "error" */

  import { goto, pushState, replaceState } from '$app/navigation';
  import { resolve, asset } from '$app/paths';
  import { page } from '$app/state';

  let { href } = $props();

  goto(resolve('/foo'));
  goto(resolve('/blog/[slug]', { slug: 'hello' }));
  goto(resolve('/search') + '?q=svelte');
  goto(href); // unknown value: not reported by default
  goto(new URL(resolve('/foo'), page.url));

  // shallow routing
  pushState('', {});
  replaceState('?tab=info', {});
</script>

<a href={resolve('/foo')}>Click me!</a>
<a href="{resolve('/search')}?q={query}">Click me!</a>
<a href={asset('/manual.pdf')}>Click me!</a>
<!-- SvelteKit 3: asset('manual.pdf') -->
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
  goto('mailto:hello@example.com');
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

With type information, string literal types are checked too. A literal type is used only when it is written out in the code: as a type annotation (for example of a prop) or as a literal value (for example `export const ABOUT = '/about'`). A literal type that comes from a function result (for example `<T>(path: T) => T`) is not trusted, because the function may add the base path.

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

If you really need to build a URL by hand (for example a path that has no route, handled in a hook), cast it with `as ResolvedPathname` or use an `eslint-disable` comment. In JavaScript, JSDoc casts such as `/** @type {ResolvedPathname} */ (url)` are not recognized, so use an `eslint-disable` comment there.

### `.ts` / `.js` files

The rule also checks `goto()` and other calls in plain `.js` / `.ts` files (for example in `src/lib`) when ESLint lints them.

### Limitations

- The rule does not know what functions return. For example, a helper that builds a localized URL without the base path is not reported. Use `strict` if you need to catch those.
- The rule does not know your router type. On SvelteKit 3 with `router.type: 'hash'`, `goto('#foo')` is not reported, although it does not work there. On SvelteKit 2 with `router.type: 'hash'` and a base path, `resolve()` itself returns a broken URL ([sveltejs/kit#14894](https://github.com/sveltejs/kit/issues/14894)).
- An element with a spread attribute (`<a {...props} href="/about">`) is not checked, because the spread may set `rel` or replace the URL. `strict` checks it.
- When an object or array may be changed after it is declared (e.g. `link.href = ...`, `links.push(...)`, `url.pathname = ...`, or passing it to a function), its value is treated as unknown.
- `<svelte:element this="a">` is not checked.
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

- `strict` ... Also report URL values that the analysis cannot verify, such as props, `data`, imports and function results, and values added after `resolve()` that are not known to start with `?` or `#`. Values typed as `ResolvedPathname` (or `URL & { pathname: ResolvedPathname }`) and `page.url` are accepted. Default `false`.
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
