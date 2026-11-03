---
'eslint-plugin-svelte': minor
---

feat(no-navigation-without-resolve): rebuild the rule to report only URLs that are known to skip the base path or bypass `resolve()`

- Values that the rule cannot understand (props, `data`, imports, function results, `any`) are no longer reported. Use the new `strict` option to report them.
- `?query`, `#hash`, `''`, `page.url`, query/hash after `resolve()`, and nullable `ResolvedPathname` values are allowed.
- New reports: relative URLs (allow them with `allowRelativePaths`), anything before `resolve()`, a path after `resolve()`, external URLs in `goto()` / `pushState()` / `replaceState()` / `preloadData()`, `<area>`, SVG `<a>`, `<form action>`, `formaction`, `preloadData()`, `preloadCode()` (SvelteKit 2) and a URL passed to `preloadCode()` on SvelteKit 3.
- Values are followed through reassignments, `$state()`, `$derived()`, `$props()` defaults, `{#each}` and TypeScript string literal types.
- Messages explain the problem, and suggestions wrap the URL with `resolve()` / `asset()` (SvelteKit 3 pathnames have no leading slash).
- The rule no longer runs on SvelteKit 1 and SvelteKit 2 before 2.26, where `resolve()` does not exist.
- `ignoreGoto`, `ignoreLinks`, `ignorePushState` and `ignoreReplaceState` are deprecated and will be removed in the next major version.
