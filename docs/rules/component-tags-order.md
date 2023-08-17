---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/component-tags-order"
description: "Enforce order of component top-level elements"
---

# svelte/component-tags-order

> Enforce order of component top-level elements

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule warns about the order of the top-level tags, such as `<script>`, template and `<style>`.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```svelte
<svelte:options />

<!-- ✓ GOOD -->

<script context="module">
  /* eslint svelte/component-tags-order: "error" */
</script>

<script>
  export let foo
</script>

<svelte:window />
<svelte:document />
<svelte:head />
<svelte:body />
<div />

<style>
  p {
    color: blue;
  }
</style>
```

</ESLintCodeBlock>

---

<ESLintCodeBlock fix>

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<!-- ✗ BAD -->

<script>
  /* eslint svelte/component-tags-order: "error" */
  export let foo
</script>

<script context="module">
  const bar = 42
</script>
```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

---

<ESLintCodeBlock fix>

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<!-- ✗ BAD -->
<div>{foo}</div>

<style>
  div {
    color: blue;
  }
</style>

<script>
  /* eslint svelte/component-tags-order: "error" */
  export let foo
</script>

```

<!-- prettier-ignore-end -->

</ESLintCodeBlock>

## :wrench: Options

```json
{
  "svelte/component-tags-order": [
    "error",
    {
      "order": [
        "SvelteScriptElement([context=module])",
        "SvelteScriptElement",
        "SvelteElement([svelte:options])",
        "SvelteElement([svelte:window])",
        "SvelteElement([svelte:document])",
        "SvelteElement([svelte:head])",
        "SvelteElement([svelte:body])",
        "SvelteElement",
        "SvelteStyleElement"
      ]
    }
  ]
}
```

- Regarding the order notation

There are some differences between `<script>`, `<style>` and elements.

For `<script>`, write `SvelteScriptElement` or `SvelteScriptElement([attrKey=attrValue])` or `SvelteScriptElement([attrKey])`. (e.g. `SvelteScriptElement([context=module])`). If only attrKey is specified, matches if that attribute is present. (Matches regardless of the attribute value.)<br/>
And multiple attributes can be specified. (e.g. `SvelteScriptElement([context=module, lang=ts])`) In this case, it will be evaluate as AND match.<br/>
For `<style>`, almost same as `<script>` but write `SvelteStyleElement` instead of `SvelteScriptElement`.<br/>
For elements, write `SvelteElement` or `SvelteElement([tagName])`.<br/>
And multiple tag names can be specified. (e.g. `SvelteElement([div, span])`)<br>

Also negation can be used for attribute values. (e.g. `SvelteElement:not([div, span])`) <br/>
In this example, it matches template elements other than `<div>` and `<span>`.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/component-tags-order.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/component-tags-order.ts)
