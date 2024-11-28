---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-dynamic-slot-name'
description: 'disallow dynamic slot name'
since: 'v0.14.0'
---

# svelte/no-dynamic-slot-name

> disallow dynamic slot name

- :gear: This rule is included in `"plugin:svelte/recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the dynamically specified `<slot>` name.  
Dynamic `<slot>` names are not allowed in Svelte, so you must use static names.

The auto-fix of this rule can be replaced with a static `<slot>` name if the expression given to the `<slot>` name is static and resolvable.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dynamic-slot-name: "error" */
  const SLOT_NAME = 'bad';
</script>

<!-- ✓ GOOD -->
<slot name="good" />

<!-- ✗ BAD -->
<slot name={SLOT_NAME} />
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.14.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-dynamic-slot-name.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-dynamic-slot-name.ts)
