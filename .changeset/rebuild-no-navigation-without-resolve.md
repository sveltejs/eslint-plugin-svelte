---
'eslint-plugin-svelte': minor
---

feat(no-navigation-without-resolve): rebuild the rule to report only URLs that are known to skip the base path or bypass `resolve()`

**Default behavior**

- Values the rule cannot understand (props, `data`, function results, `any`) are no longer reported. Use the new `strict` option to report them.
- Allowed: `''`, `?query`, `#hash`, `page.url`, a query or hash after `resolve()`, nullable `ResolvedPathname` values, and HTTP(S) or protocol-relative URLs in navigation calls (they may be same-origin; `strict` reports them).
- Relative URLs usually keep the base path, so they are reported only with `strict` or `allowRelativePaths: false`.
- Forms with `rel="external"`, non-submitting controls and dialog submissions are not checked. Submit buttons follow their form owner and the `form` / `formmethod` attributes.

**New checks**

- Newly checked: `<area>`, SVG `<a>`, `<form action>`, `formaction`, `preloadData()` and `preloadCode()` (first argument only).
- New reports: anything before `resolve()`, a path after `resolve()`, non-HTTP(S) URLs in `goto()` / `pushState()` / `replaceState()` / `preloadData()`, and a URL passed to `preloadCode()` on SvelteKit 3 (it takes a route ID). On SvelteKit 2, `preloadCode()` needs a root-relative pathname.

**Analysis**

- Values are followed through reassignments, `$state()`, `$derived()`, `$props()` defaults, arrays, objects, `{#each}` and declared TypeScript string literal types.
- Messages explain the problem, and suggestions wrap the URL with `resolve()` / `asset()` (SvelteKit 3 pathnames have no leading slash).

**Compatibility**

- The rule no longer runs on SvelteKit 1 or SvelteKit 2 before 2.26, where `resolve()` does not exist.
- `ignoreGoto`, `ignoreLinks`, `ignorePushState` and `ignoreReplaceState` are deprecated and will be removed in the next major version.
