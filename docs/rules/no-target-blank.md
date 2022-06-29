---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-target-blank"
description: "disallow `target=\"_blank\"` attribute without `rel=\"noopener noreferrer\"`"
since: "v0.0.4"
---

# svelte/no-target-blank

> disallow `target="_blank"` attribute without `rel="noopener noreferrer"`

## :book: Rule Details

This rule disallows using `target="_blank"` attribute without `rel="noopener noreferrer"` to avoid a security vulnerability([see here for more details](https://mathiasbynens.github.io/rel-noopener/)).

<ESLintCodeBlock>

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

</ESLintCodeBlock>

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

- `allowReferrer` ... If `true`, does not require noreferrer.default `false`
- `enforceDynamicLinks ("always" | "never")` ... If `always`, enforces the rule if the href is a dynamic link. default `always`.

### `{ allowReferrer: false }` (default)

<ESLintCodeBlock>

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

</ESLintCodeBlock>

### `{ allowReferrer: true }`

<ESLintCodeBlock>

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

</ESLintCodeBlock>

### `{ "enforceDynamicLinks": "always" }` (default)

<ESLintCodeBlock>

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

</ESLintCodeBlock>

### `{ "enforceDynamicLinks": "never" }`

<ESLintCodeBlock>

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

</ESLintCodeBlock>

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.4

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-target-blank.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-target-blank.ts)
