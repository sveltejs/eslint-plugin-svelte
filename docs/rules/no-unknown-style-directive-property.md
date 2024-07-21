---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-unknown-style-directive-property'
description: 'disallow unknown `style:property`'
since: 'v0.31.0'
---

# svelte/no-unknown-style-directive-property

> disallow unknown `style:property`

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## 📖 Rule Details

This rule reports an unknown CSS property in style directive.

This rule was inspired by [Stylelint's property-no-unknown rule](https://stylelint.io/user-guide/rules/list/property-no-unknown/).

Note that this rule only checks the `style:property` directive. If you want to check inside the `style` attribute and `style` element, consider introducing [Stylelint](https://stylelint.io/).

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-unknown-style-directive-property: "error" */
  let red = 'red';
  let color = red;
</script>

<!-- ✓ GOOD -->
<div style:color={red}>...</div>
<div style:color>...</div>

<!-- ✗ BAD -->
<div style:unknown-color={red}>...</div>
<div style:red>...</div>
```

</ESLintCodeBlock>

## 🔧 Options

```json
{
  "svelte/no-unknown-style-directive-property": [
    "error",
    {
      "ignoreProperties": [],
      "ignorePrefixed": true
    }
  ]
}
```

- `ignoreProperties` ... You can specify property names or patterns that you want to ignore from checking. When specifying a pattern, specify a string like a regex literal. e.g. `"/pattern/i"`
- `ignorePrefixed` ... If `true`, ignores properties with vendor prefix from checking. Default is `true`.

## 📚 Further reading

- [Stylelint - property-no-unknown]

[stylelint - property-no-unknown]: https://stylelint.io/user-guide/rules/list/property-no-unknown/

## 🚀 Version

This rule was introduced in eslint-plugin-svelte v0.31.0

## 🔍 Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-unknown-style-directive-property.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-unknown-style-directive-property.ts)
