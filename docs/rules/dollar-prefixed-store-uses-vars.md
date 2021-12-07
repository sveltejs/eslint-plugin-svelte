---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/dollar-prefixed-store-uses-vars"
description: "prevent $-prefixed variables to be marked as unused"
---

# @ota-meshi/svelte/dollar-prefixed-store-uses-vars

> prevent $-prefixed variables to be marked as unused

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/base"` and `"plugin:@ota-meshi/svelte/recommended"`.

ESLint `no-unused-vars` rule does not detect store variables used as $-prefixed.
This rule will find imported store variables that are used as $-prefixed and marks them as used.

This rule only has an effect when the `no-unused-vars` rule is enabled.

## :book: Rule Details

Without this rule this code triggers warning:

<ESLintCodeBlock rules="{ { 'no-unused-vars': ['error'] } }">

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/dollar-prefixed-store-uses-vars: "error" */
  import { a } from "./my-stores"

  // The variable doesn't look like it's being referenced, but it may be used externally.
  $a = 42
</script>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/dollar-prefixed-store-uses-vars.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/dollar-prefixed-store-uses-vars.ts)
