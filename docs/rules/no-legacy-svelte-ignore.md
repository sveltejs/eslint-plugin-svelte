---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-legacy-svelte-ignore'
description: 'disallow legacy kebab-case codes in svelte-ignore comments'
---

# svelte/no-legacy-svelte-ignore

> disallow legacy kebab-case codes in svelte-ignore comments

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports `svelte-ignore` comments that use the kebab-case warning codes from Svelte 3 and 4, such as `a11y-autofocus`.

Svelte 5 changed warning codes to snake_case, such as `a11y_autofocus`. In runes mode, Svelte 5 no longer accepts the legacy codes, so a `svelte-ignore` comment that uses them does not silence the warning (the compiler reports [`legacy_code`](https://svelte.dev/docs/svelte/compiler-warnings#legacy_code) instead). In non-runes mode, Svelte 5 still reads them for backward compatibility, but that support may be removed in a future version.

The auto-fix replaces each legacy code with the new code. Most codes only need their hyphens replaced with underscores, but some were renamed (for example, `empty-block` became `block_empty`).

This rule only runs on Svelte 5. In runes mode, Svelte reads the codes after the first one that is not followed by a comma as prose, so this rule does not report them.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-legacy-svelte-ignore: "error" */
  let { src } = $props();
</script>

<!-- ✓ GOOD -->
<!-- svelte-ignore a11y_autofocus, a11y_missing_attribute -->
<img {src} autofocus />

<div>
  <!-- svelte-ignore block_empty -->
  {#await Promise.resolve(src)}{/await}
</div>

<!-- ✗ BAD -->
<!-- svelte-ignore a11y-autofocus, a11y-missing-attribute -->
<img {src} autofocus />

<div>
  <!-- svelte-ignore empty-block -->
  {#await Promise.resolve(src)}{/await}
</div>
```

## :wrench: Options

Nothing.

## :couple: Related Rules

- [svelte/no-unused-svelte-ignore](./no-unused-svelte-ignore.md)
- [svelte/valid-compile](./valid-compile.md)

## :books: Further Reading

- [Svelte - Comments](https://svelte.dev/docs/svelte/basic-markup#Comments)
- [Svelte - Compiler warnings](https://svelte.dev/docs/svelte/compiler-warnings)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-legacy-svelte-ignore.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-legacy-svelte-ignore.ts)
