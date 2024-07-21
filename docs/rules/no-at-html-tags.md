---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-at-html-tags'
description: 'disallow use of `{@html}` to prevent XSS attack'
since: 'v0.0.1'
---

# svelte/no-at-html-tags

> disallow use of `{@html}` to prevent XSS attack

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## 📖 Rule Details

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

## 🔧 Options

Nothing.

## :mute: When Not To Use It

If you are certain the content passed to `{@html}` is sanitized HTML you can disable this rule.

## 📚 Further Reading

- [Svelte - Tutorial > 1. Introduction / HTML tags](https://svelte.dev/tutorial/html-tags)

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.0.1

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-at-html-tags.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-at-html-tags.ts)
