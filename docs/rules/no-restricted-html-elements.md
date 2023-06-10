---
pageClass: "rule-details"
sidebarDepth: 0
title: "svelte/no-restricted-html-elements"
description: "disallow specific HTML elements"
---

# svelte/no-restricted-html-elements

> disallow specific HTML elements

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports to usage of resticted HTML elements.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-restricted-html-elements: ["error", "h1", "h2", "h3", "h4", "h5", "h6"] */
</script>

<!-- ✓ GOOD -->
<div>
  <p>Hi!</p>
</div>

<!-- ✗ BAD -->
<h1>foo</h1>

<div>
  <h2>bar</h2>
</div>
```

</ESLintCodeBlock>

---

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-restricted-html-elements: ["error", { "elements": ["marquee"], "message": "Do not use deprecated HTML tags" }] */
</script>

<!-- ✓ GOOD -->
<div>
  <p>Hi!</p>
</div>

<!-- ✗ BAD -->
<marquee>foo</marquee>

<div>
  <marquee>bar</marquee>
</div>
```

</ESLintCodeBlock>

## :wrench: Options

This rule takes a list of strings, where each string is an HTML element name to be restricted:

```json
{
  "svelte/no-restricted-html-elements": [
    "error",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
  ]
}
```

Alternatively, the rule also accepts objects.

```json
{
  "svelte/no-restricted-html-elements": [
    "error",
    {
      "elements": "h1", "h2", "h3", "h4", "h5", "h6",
      "message": "Prefer use of our custom <Heading /> component"
    },
    {
      "elements": ["marquee"],
      "message": "Do not use deprecated HTML tags"
    }
  ]
}
```

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/no-restricted-html-elements.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/no-restricted-html-elements.ts)
