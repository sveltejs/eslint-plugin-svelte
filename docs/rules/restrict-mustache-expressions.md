---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/restrict-mustache-expressions'
description: 'disallow non-string values in string contexts'
---

# svelte/restrict-mustache-expressions

> disallow non-string values in string contexts

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

JavaScript automatically converts an [object to a string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion)
in a string context, such as when concatenating strings or using them in a template string. The default toString() method of objects returns
`[object Object]`. This is typically incorrect behavior.

This rule prevents non-stringifiable values from being used in contexts where a string is expected.

This rule is based off the [restrict-template-expressions](https://typescript-eslint.io/rules/restrict-template-expressions) rule, and it is recommended to be used
with that rule, as this only performs checks on svelte template strings (eg: `<a href="foo/{bar}">foo</a>`), and not on ``<a href={`/foo/${bar}`}>foo</a>``.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/restrict-mustache-expressions: "error" */

  let str: string = 'foo';
  let not_stringifiable = { foo: 'bar' };
</script>

<!-- ✓ GOOD -->
<a href="foo/{123}">foo</a>
<a href="foo/{str}">foo</a>
<a href="foo/{true}">foo</a>

{123}
{str}
{true}

<!-- ✗ BAD -->
<a href="foo/{null}">foo</a>
<a href="foo/{undefined}">foo</a>
<a href="foo/{[1, 2, 3]}">foo</a>
<a href="foo/{not_stringifiable}">foo</a>

{null}
{undefined}
{[1, 2, 3]}
{not_stringifiable}
```

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/restrict-mustache-expressions": ["error", {}]
}
```

```ts
type Options = {
  // allows numbers in both svelte template literals and text expressions
  allowNumbers?: boolean;
  // allows booleans in both svelte template literals and text expressions
  allowBooleans?: boolean;
  // allows null in both svelte template literals and text expressions
  allowNull?: boolean;
  // allows undefined in both svelte template literals and text expressions
  allowUndefined?: boolean;
  textExpressions?: {
    // allows numbers in text expressions
    allowNumbers?: boolean;
    // allows booleans in text expressions
    allowBooleans?: boolean;
    // allows null in text expressions
    allowNull?: boolean;
    // allows undefined in text expressions
    allowUndefined?: boolean;
  };
  stringTemplateExpressions?: {
    // allows numbers in string template expressions
    allowNumbers?: boolean;
    // allows booleans in string template expressions
    allowBooleans?: boolean;
    // allows null in string template expressions
    allowNull?: boolean;
    // allows undefined in string template expressions
    allowUndefined?: boolean;
  };
};

type DefaultOptions = {
  allowNumbers: true;
  allowBooleans: true;
  allowNull: false;
  allowUndefined: false;
};
```

## More examples

<ESLintCodeBlock>

### Disallowing numbers

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/restrict-mustache-expressions: ["error", { "allowNumbers": false }] */
</script>

<!-- ✓ GOOD -->
<a href="foo/{str}">foo</a>
{str}

<!-- ✗ BAD -->
<a href="foo/{123}">foo</a>
{123}
```

</ESLintCodeBlock>

### Disallowing booleans

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/restrict-mustache-expressions: ["error", { "allowBooleans": false }] */
</script>

<!-- ✓ GOOD -->
{str}

<!-- ✗ BAD -->
<a href="foo/{true}">foo</a>
```

</ESLintCodeBlock>

### Disallowing numbers specifically for text expressions

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/restrict-mustache-expressions: ["error", { "textExpressions": { "allowNumbers": false } }] */
</script>

<!-- ✓ GOOD -->
<a href="foo/{123}">foo</a>

<!-- ✗ BAD -->
{123}
```

</ESLintCodeBlock>

### Disallowing booleans specifically for string template expressions

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/restrict-mustache-expressions: ["error", { "stringTemplateExpressions": { "allowBooleans": false } }] */
</script>

<!-- ✓ GOOD -->
{true}

<!-- ✗ BAD -->
<a href="foo/{true}">foo</a>
```

</ESLintCodeBlock>

## :books: Further Reading

- [no-base-to-string](https://typescript-eslint.io/rules/no-base-to-string)
- [restrict-plus-operands](https://typescript-eslint.io/rules/restrict-plus-operands)
- [restrict-template-expressions](https://typescript-eslint.io/rules/restrict-template-expressions)

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/restrict-mustache-expressions.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/restrict-mustache-expressions.ts)
