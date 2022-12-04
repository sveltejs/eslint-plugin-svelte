---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-dupe-use-directives"
description: "disallow duplicate `use:` directives"
since: "v2.14.0"
---

# svelte/no-dupe-use-directives

> disallow duplicate `use:` directives

## :book: Rule Details

We can define any number of `use:` directive with the same action, but duplicate directives with the exact same action and expression are probably a mistake.
This rule reports reports `use:` directives with exactly the same action and expression.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dupe-use-directives: "error" */
</script>

<!-- ✓ GOOD -->
<div use:clickOutside use:clickOutside={param} />
<div use:clickOutside={foo} use:clickOutside={bar} />

<!-- ✗ BAD -->
<div use:clickOutside use:clickOutside />
<div use:clickOutside={param} use:clickOutside={param} />
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.14.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-dupe-use-directives.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-dupe-use-directives.ts)
