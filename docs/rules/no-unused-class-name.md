---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-unused-class-name'
description: 'disallow the use of a class in the template without a corresponding style'
since: 'v2.31.0'
---

# svelte/no-unused-class-name

> disallow the use of a class in the template without a corresponding style

## :book: Rule Details

This rule is aimed at reducing unused classes in the HTML template. While `svelte-check` will produce the `css-unused-selector` if your `<style>` block includes any classes that aren't used in the template, this rule works the other way around - it reports cases wehre the template contains classes that aren't referred to in the `<style>` block.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/no-unused-class-name: "error" */
</script>

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

## :wrench: Options

```json
{
  "svelte/no-unused-class-name": [
    "error",
    {
      "allowedClassNames": ["class-name-one", "class-name-two"]
    }
  ]
}
```

- `allowedClassNames` ... A list of class names that shouldn't be reported by this rule. Default `[]`.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.31.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-unused-class-name.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-unused-class-name.ts)
