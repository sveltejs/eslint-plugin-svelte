---
'eslint-plugin-svelte': minor
---

fix(no-navigation-without-resolve): checking all parts of link attributes, not just the first one

Links whose `href` is made of several parts, such as `href="{resolve('/search')}{queryString}"` or `href="{resolve('/blog')}/{slug}"`, were allowed as long as the first part was resolved. Now everything after the resolved value has to be a query or a fragment, i.e. it has to start with `?` or `#` (literally, or as a variable whose value starts with it), so such links are newly reported. To fix them, pass the whole path to `resolve()` (e.g. `resolve('/blog/[slug]', { slug })`) and start the query or fragment with a literal `?` or `#` (e.g. `href="{resolve('/search')}?{params}"`).
