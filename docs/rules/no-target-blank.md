---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-target-blank"
description: "disallow target=\"_blank\" attribute without rel=\"noopener noreferrer\""
since: "v0.0.4"
---

# @ota-meshi/svelte/no-target-blank

> disallow target="_blank" attribute without rel="noopener noreferrer"

## :book: Rule Details

This rule disallows using `target="_blank"` attribute without `rel="noopener noreferrer"` to avoid a security vulnerability([see here for more details](https://mathiasbynens.github.io/rel-noopener/)).

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-target-blank: "error" */
</script>

<!-- ✓ GOOD -->
<a href="http://example.com" target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/no-target-blank": [
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

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-target-blank: ['error', { allowReferrer: false }] */
</script>

<!-- ✓ Good -->
<a href="http://example.com" target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank" rel="noopener">link</a>
```

</eslint-code-block>

### `{ allowReferrer: true }`

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-target-blank: ['error', { allowReferrer: true }] */
</script>

<!-- ✓ Good -->
<a href="http://example.com" target="_blank" rel="noopener">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

</eslint-code-block>

### `{ "enforceDynamicLinks": "always" }` (default)

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-target-blank: ['error', { enforceDynamicLinks: 'always' }] */
</script>

<!-- ✓ Good -->
<a href={link} target="_blank" rel="noopener noreferrer">link</a>

<!-- ✗ BAD -->
<a href={link} target="_blank">link</a>
```

</eslint-code-block>

### `{ "enforceDynamicLinks": "never" }`

<eslint-code-block>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-target-blank: ['error', { enforceDynamicLinks: 'never' }] */
</script>

<!-- ✓ Good -->
<a href={link} target="_blank">link</a>

<!-- ✗ BAD -->
<a href="http://example.com" target="_blank">link</a>
```

</eslint-code-block>

## :rocket: Version

This rule was introduced in @ota-meshi/eslint-plugin-svelte v0.0.4

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-target-blank.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-target-blank.ts)
