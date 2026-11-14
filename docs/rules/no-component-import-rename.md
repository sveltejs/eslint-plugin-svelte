---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-component-import-rename'
description: 'disallow importing components under a name that does not match their file name'
---

# svelte/no-component-import-rename

> disallow importing components under a name that does not match their file name

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports components imported from `.svelte` files under a name that does not match the file name.

When a component file is renamed, imports such as `import Foo from './Bar.svelte'` keep working, so the old name is easily left behind. Naming each import after its file keeps the names used in your code consistent with the files they come from.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-component-import-rename: "error" */

  // ✓ GOOD
  import Bar from './Bar.svelte';
  import MyButton from './my-button.svelte';
  import Page from './+page.svelte';
  import { default as Card } from '$lib/Card.svelte';

  // ✗ BAD
  import Foo from './Bar.svelte';
  import Button from './my-button.svelte';
  import { default as Item } from '$lib/Card.svelte';
</script>
```

The rule also checks re-exports of a component's default export, as used in barrel files:

<!--eslint-skip-->

```js
/* eslint svelte/no-component-import-rename: "error" */

// ✓ GOOD
export { default as Bar } from './Bar.svelte';

// ✗ BAD
export { default as Foo } from './Bar.svelte';
```

The name matches the file name if it is either:

- the file name without the `.svelte` extension, such as `Bar` for `Bar.svelte`, or
- the file name converted to PascalCase, such as `MyButton` for `my-button.svelte`, `UserCard` for `user_card.svelte` and `Page` for `+page.svelte`.

Only default imports and re-exports of the default export are checked. Named imports, namespace imports and dynamic imports are ignored, as are files whose name cannot be converted to a valid identifier, such as `404.svelte`.

## :wrench: Options

Nothing.

## :mute: When Not To Use It

If you intentionally import components under names that differ from their file names, for example to avoid conflicts between components with the same file name in different directories, you can turn this rule off.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-component-import-rename.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-component-import-rename.ts)
