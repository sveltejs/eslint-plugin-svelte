---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-target-blank'
description: 'disallow `target="_blank"` attribute without `rel="noopener noreferrer"`'
since: 'v0.0.4'
---

# svelte/no-target-blank

> disallow `target="_blank"` attribute without `rel="noopener noreferrer"`

## :book: Rule Details

This rule disallows using `target="_blank"` attribute without `rel="noopener noreferrer"` to avoid a security vulnerability in legacy browsers where a page can trigger a navigation in the opener regardless of origin ([see here for more details](https://mathiasbynens.github.io/rel-noopener/)).

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-target-blank: "error" */
</script>

<!-- ✓ GOOD -->
<a href="http://example.com" target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

## :wrench: Options

```json
{
  "svelte/no-target-blank": [
    "error",
    {
      "allowReferrer": true,
      "enforceDynamicLinks": "always"
    }
  ]
}
```

- `allowReferrer` ... If `true`, allows the `Referrer` header to be sent by not requiring `noreferrer` to be present. default `false`
- `enforceDynamicLinks ("always" | "never")` ... If `always`, enforces the rule if the href is a dynamic link. default `always`

### `{ allowReferrer: false }` (default)

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-target-blank: ['error', { allowReferrer: false }] */
</script>

<!-- ✓ GOOD -->
<a href="http://example.com" target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank" rel="noopener">link</a>
```

### `{ allowReferrer: true }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-target-blank: ['error', { allowReferrer: true }] */
</script>

<!-- ✓ GOOD -->
<a href="http://example.com" target="_blank" rel="noopener">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

### `{ "enforceDynamicLinks": "always" }` (default)

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-target-blank: ['error', { enforceDynamicLinks: 'always' }] */
</script>

<!-- ✓ GOOD -->
<a href={link} target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href={link} target="_blank">link</a>
```

### `{ "enforceDynamicLinks": "never" }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-target-blank: ['error', { enforceDynamicLinks: 'never' }] */
</script>

<!-- ✓ GOOD -->
<a href={link} target="_blank">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.4

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-target-blank.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-target-blank.ts)
