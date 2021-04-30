---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-at-html-tags"
description: "disallow use of `{@html}` to prevent XSS attack"
---
# @ota-meshi/svelte/no-at-html-tags

> disallow use of `{@html}` to prevent XSS attack

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule reports all uses of `{@html}` in order to reduce the risk of injecting potentially unsafe / unescaped html into the browser leading to Cross-Site Scripting (XSS) attacks.

<eslint-code-block>

<!--eslint-skip-->

```html
<script>
  /* eslint @ota-meshi/svelte/no-at-html-tags: "error" */
</script>

<!-- ✓ GOOD -->
{foo}

<!-- ✗ BAD -->
{@html foo}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mute: When Not To Use It

If you are certain the content passed to `{@html}` is sanitized HTML you can disable this rule.

## :books: Further Reading

- [Svelte - Tutorial > 1. Introduction / HTML tags](https://svelte.dev/tutorial/html-tags)

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-at-html-tags.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-at-html-tags.ts)
