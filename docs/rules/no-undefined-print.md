---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-undefined-print'
description: 'Disallow from printing `undefined`'
since: 'v0.0.1'
---

# svelte/no-undefined-print

> Disallow from printing `undefined`

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports all uses of `{@html}` in order to reduce the risk of injecting potentially unsafe / unescaped html into the browser leading to Cross-Site Scripting (XSS) attacks.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-at-html-tags: "error" */
</script>

<!-- ✓ GOOD -->
{foo}

<!-- ✗ BAD -->
{@html foo}
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mute: When Not To Use It

If you are certain the content passed to `{@html}` is sanitized HTML you can disable this rule.

## :books: Further Reading

- [Svelte - Tutorial > 1. Introduction / HTML tags](https://svelte.dev/tutorial/html-tags)

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.0.1

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-undefined-print.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-undefined-print.ts)
