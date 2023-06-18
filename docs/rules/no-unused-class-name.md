---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-unused-class-name"
description: "disallow the use of a class in the template without a corresponding style"
---

# svelte/no-unused-class-name

> disallow the use of a class in the template without a corresponding style

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule is aimed at reducing unused classes in the HTML template. While `svelte-check` will produce the `css-unused-selector` if your `<style>` block includes any classes that aren't used in the template, this rule works the other way around - it reports cases wehre the template contains classes that aren't referred to in the `<style>` block.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/no-unused-class-name: "error" */
</scrip>

<!-- ✓ GOOD -->
<div class="first-class">Hello</div>
<div class="second-class">Hello</div>
<div class="third-class fourth-class">Hello</div>

<!-- ✗ BAD -->
<div class="fifth-class">Hello</div>
<div class="sixth-class first-class">Hello</div>

<style>
 .first-class {
  color: red;
 }

 .second-class,
 .third-class {
  color: blue;
 }

 .fourth-class {
  color: green;
 }
</style>
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-unused-class-name.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-unused-class-name.ts)
