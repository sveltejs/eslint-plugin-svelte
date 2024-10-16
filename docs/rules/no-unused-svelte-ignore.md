---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-unused-svelte-ignore'
description: 'disallow unused svelte-ignore comments'
since: 'v0.19.0'
---

# svelte/no-unused-svelte-ignore

> disallow unused svelte-ignore comments

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## 📖 Rule Details

This rule warns unnecessary `svelte-ignore` comments.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-unused-svelte-ignore: "error" */
</script>

<!-- ✓ GOOD -->
<!-- svelte-ignore a11y-autofocus a11y-missing-attribute -->
<img src="https://example.com/img.png" autofocus />

<!-- ✗ BAD -->
<!-- svelte-ignore a11y-autofocus a11y-missing-attribute -->
<img src="https://example.com/img.png" alt="Foo" />
```

</ESLintCodeBlock>

## 🔧 Options

Nothing.

## 📚 Further Reading

- [Svelte - Docs > Comments](https://svelte.dev/docs#template-syntax-comments)

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.19.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-unused-svelte-ignore.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-unused-svelte-ignore.ts)
