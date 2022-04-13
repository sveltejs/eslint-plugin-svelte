---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/no-unknown-style-directive-property"
description: "disallow unknown `style:property`"
---

# @ota-meshi/svelte/no-unknown-style-directive-property

> disallow unknown `style:property`

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:@ota-meshi/svelte/recommended"`.

## :book: Rule Details

This rule reports an unknown CSS property in style directive.

This rule was inspired by [Stylelint's property-no-unknown rule](https://stylelint.io/user-guide/rules/list/property-no-unknown/).

Note that this rule only checks the `style:property` directive. If you want to check inside the `style` attribute and `style` element, consider introducing [Stylelint](https://stylelint.io/).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/no-unknown-style-directive-property: "error" */
  let red = "red"
  let color = red
</script>

<!-- ✓ GOOD -->
<div style:color={red}>...</div>
<div style:color>...</div>

<!-- ✗ BAD -->
<div style:unknown-color={red}>...</div>
<div style:red>...</div>
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "@ota-meshi/svelte/no-unknown-style-directive-property": [
    "error",
    {
      "ignoreProperties": [],
      "ignorePrefixed": true
    }
  ]
}
```

- `ignoreProperties` ... You can specify property names or patterns that you want to ignore from checking.
- `ignorePrefixed` ... If `true`, ignores properties with vendor prefix from checking. Default is `true`.

## :books: Further reading

- [Stylelint - property-no-unknown]

[stylelint - property-no-unknown]: https://stylelint.io/user-guide/rules/list/property-no-unknown/

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-unknown-style-directive-property.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-unknown-style-directive-property.ts)
