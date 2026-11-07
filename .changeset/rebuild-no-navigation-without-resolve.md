---
'eslint-plugin-svelte': minor
---

feat(no-navigation-without-resolve): rebuild the rule to check statically identifiable URL patterns and skip unknown values by default

- Values that the rule cannot understand (props, `data`, function results, `any`) are no longer reported. Use the new `strict` option to report them.
- This is a base-path navigation policy check, not proof that a URL is broken; the rule does not know the deployment origin or routing configuration.
- `?query`, `#hash`, `''`, `page.url`, query/hash after `resolve()`, and nullable `ResolvedPathname` values are allowed.
- Newly checked: `<area>`, SVG `<a>`, `<form action>`, `formaction`, `preloadData()` and `preloadCode()`.
- New reports: relative URLs (allow them with `allowRelativePaths`), anything before `resolve()`, a path after `resolve()`, non-HTTP(S) URLs in `goto()` / `pushState()` / `replaceState()` / `preloadData()`, and a URL passed to `preloadCode()` on SvelteKit 3 (it takes a route ID).
- HTTP(S) and protocol-relative URLs in navigation calls may be same-origin; they are skipped by default and reported as unverifiable with `strict`. SvelteKit 2 `preloadCode()` requires a root-relative pathname, while SvelteKit 3 requires a route ID. Only its first argument is checked.
- Forms marked `rel="external"`, non-submitting controls and dialog submissions are exempt. Submit controls use their form owner and effective method, including `form` and `formmethod` overrides. The form exemption is a lint policy, not a guarantee that SvelteKit routing or `use:enhance` is bypassed.
- Values are followed through reassignments, `$state()`, `$derived()`, `$props()` defaults, `{#each}` and declared TypeScript string literal types.
- Messages explain the problem, and suggestions wrap the URL with `resolve()` / `asset()` (SvelteKit 3 pathnames have no leading slash).
- The rule no longer runs on SvelteKit 1 and SvelteKit 2 before 2.26, where `resolve()` does not exist.
- `ignoreGoto`, `ignoreLinks`, `ignorePushState` and `ignoreReplaceState` are deprecated and will be removed in the next major version.
