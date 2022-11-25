---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-dupe-on-directives"
description: "disallow duplicate `on:` directives"
---

# svelte/no-dupe-on-directives

> disallow duplicate `on:` directives

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

We can define any number of `on:` directive with the same event name, but duplicate directives with the exact same event name and expression are probably a mistake.
This rule reports reports `on:` directives with exactly the same event name and expression.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-dupe-on-directives: "error" */
</script>

<!-- ✓ GOOD -->
<button on:click on:click={myHandler} />
<button on:click={foo} on:click={bar} />

<!-- ✗ BAD -->
<button on:click on:click />
<button on:click={myHandler} on:click={myHandler} />

<input
  on:focus|once
  on:focus
  on:keydown={() => console.log("foo")}
  on:keydown={() => console.log("foo")}
/>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-dupe-on-directives.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-dupe-on-directives.ts)
