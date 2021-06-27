---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/html-quotes"
description: "enforce quotes style of HTML attributes"
---

# @ota-meshi/svelte/html-quotes

> enforce quotes style of HTML attributes

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

You can choose quotes of HTML attributes from:

- Double quotes: `<div class="foo">`
- Single quotes: `<div class='foo'>`
- No quotes: `<div class=foo>`

This rule enforces the quotes style of HTML attributes.

<eslint-code-block fix>

<!--eslint-skip-->
<!-- prettier-ignore -->
```html
<script>
  /* eslint @ota-meshi/svelte/html-quotes: "error" */
</script>

<!-- ✓ GOOD -->
<input type="text" bind:value={text} />
<img {src} alt="{name} dances." />

<!-- ✗ BAD -->
<input type=text bind:value="{text}" />
<img src="{src}" alt='{name} dances.' />
```

</eslint-code-block>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/html-quotes": [
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

- `prefer` ... If `"double"`, requires double quotes. If `"single"` requires single quotes.
- `dynamic` ... Settings for dynamic attribute values and directive values using curly braces.
  - `quoted` ... If `true`, enforce the use of quotes. If `false`, do not allow the use of quotes. The default is `false`.
  - `avoidInvalidUnquotedInHTML` ... If `true`, enforces the use of quotes if they are invalid as HTML attribute when not using quotes. The default is `false`.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/html-quotes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/html-quotes.ts)
