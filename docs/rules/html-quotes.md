---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/html-quotes'
description: 'enforce quotes style of HTML attributes'
since: 'v0.5.0'
---

# svelte/html-quotes

> enforce quotes style of HTML attributes

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

You can choose quotes of HTML attributes from:

- Double quotes: `<div class="foo">`
- Single quotes: `<div class='foo'>`
- No quotes: `<div class=foo>`

This rule enforces the quotes style of HTML attributes.

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/html-quotes: "error" */
</script>

<!-- ✓ GOOD -->
<input type="text" bind:value={text} />
<img {src} alt="{name} dances." />

<!-- ✗ BAD -->
<input type=text bind:value="{text}" />
<img src="{src}" alt='{name} dances.' />
```

<!-- prettier-ignore-end -->

## :wrench: Options

```json
{
  "svelte/html-quotes": [
    "error",
    {
      "prefer": "double", // or "single"
      "dynamic": {
        "quoted": false,
        "avoidInvalidUnquotedInHTML": false
      }
    }
  ]
}
```

- `prefer` ... If `"double"`, requires double quotes. If `"single"`, requires single quotes.
- `dynamic` ... Settings for dynamic attribute values and directive values using curly braces.
  - `quoted` ... If `true`, enforce the use of quotes. If `false`, do not allow the use of quotes. The default is `false`.
  - `avoidInvalidUnquotedInHTML` ... If `true`, enforces the use of quotes if they are invalid as HTML attribute when not using quotes. The default is `false`.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/html-quotes.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/html-quotes.ts)
