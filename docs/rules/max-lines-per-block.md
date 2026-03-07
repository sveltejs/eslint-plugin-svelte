---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/max-lines-per-block'
description: 'enforce maximum number of lines in svelte component blocks'
---

# svelte/max-lines-per-block

> enforce maximum number of lines in svelte component blocks

## :book: Rule Details

This rule enforces a maximum number of lines per block (`<script>`, `<style>`, or template) in Svelte single-file components, in order to aid in maintainability and reduce complexity.

ESLint's core `max-lines` rule counts all lines in a `.svelte` file including CSS in `<style>` blocks, which penalizes components for styling rather than logic complexity. This rule allows limiting each block independently — for example, enforcing script and template limits while leaving style unchecked.

## :bulb: Usage Example

If ESLint's `max-lines` rule triggers on your Svelte components because of large `<style>` blocks, you can replace it with this rule to check only the blocks that matter:

```jsonc
{
  // Before: counts ALL lines including CSS
  // "max-lines": ["error", { "max": 300 }]

  // After: only checks script and template, ignores style
  "svelte/max-lines-per-block": [
    "error",
    {
      "script": 300,
      "template": 200,
      "skipBlankLines": true,
      "skipComments": true
    }
  ]
}
```

## :wrench: Options

```json
{
  "svelte/max-lines-per-block": [
    "error",
    {
      "script": 300,
      "template": 400,
      "style": 500,
      "skipBlankLines": true,
      "skipComments": true
    }
  ]
}
```

- `script` ... Maximum number of inner lines in `<script>` blocks. Omit to skip checking.
- `template` ... Maximum number of lines in the template (markup) region. Lines inside `<script>`, `<style>`, and `<svelte:options>` are excluded. Omit to skip checking.
- `style` ... Maximum number of inner lines in `<style>` blocks. Omit to skip checking.
- `skipBlankLines` ... Ignore blank (whitespace-only) lines when counting. Default: `false`.
- `skipComments` ... Ignore comment lines when counting. Default: `false`.

Each block option is **optional**. If a block option is not specified, that block is not checked.

## :couple: Related Rules

- [ESLint core `max-lines`](https://eslint.org/docs/rules/max-lines)
- [vue/max-lines-per-block](https://eslint.vuejs.org/rules/max-lines-per-block)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/max-lines-per-block.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/max-lines-per-block.ts)
