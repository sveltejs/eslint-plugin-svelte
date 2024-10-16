---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-inspect'
description: 'Warns against the use of `$inspect` directive'
---

# svelte/no-inspect

> Warns against the use of `$inspect` directive

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports usages of `$inspect`.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-inspect: "error" */
  // ✗ BAD
  $inspect(1);
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-inspect.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-inspect.ts)
