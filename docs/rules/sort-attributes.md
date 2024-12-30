---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/sort-attributes'
description: 'enforce order of attributes'
since: 'v2.4.0'
---

# svelte/sort-attributes

> enforce order of attributes

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims to enforce ordering of attributes.  
The default order is:

- `this` property.
- `bind:this` directive.
- `id` attribute.
- `name` attribute.
- `slot` attribute.
- `--style-props` (Alphabetical order within the same group.)
- `style` attribute, and `style:` directives.
- `class` attribute.
- `class:` directives. (Alphabetical order within the same group.)
- other attributes. (Alphabetical order within the same group.)
- `bind:` directives (other then `bind:this`), and `on:` directives.
- `use:` directives. (Alphabetical order within the same group.)
- `transition:` directive.
- `in:` directive.
- `out:` directive.
- `animate:` directive.
- `let:` directives. (Alphabetical order within the same group.)

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-attributes: "error" */
</script>

<!-- ✓ GOOD -->
<svelte:component
  this={component}
  --style-props={color}
  bind:value={componentValue}
  on:changeValue={handleChange}
  bind:metaData
/>
<input
  bind:this={foo}
  id="foo"
  style="width: 150px;"
  style:color
  class="my-input"
  class:disable
  class:enable={!disable}
  bind:value={inputValue}
  use:action={parameters}
  transition:fn
  in:fn
  out:fn
  animate:name
/>
<slot name="content" {abc} {def} />

<!-- ✗ BAD -->
<svelte:component
  bind:value={componentValue}
  this={component}
  on:changeValue={handleChange}
  {def}
  data-foo
  {abc}
  bind:metaData
  --style-props={color}
/>
<input
  id="foo"
  bind:this={foo}
  style:color
  style="width: 150px;"
  class="my-input"
  class:enable={!disable}
  class:disable
  animate:name
  use:action
  transition:fn
  bind:value={inputValue}
  in:fn
  out:fn
/>
<slot name="content" {def} {abc} data-foo />
```

<!-- prettier-ignore-end -->

If there is a spread attribute between the attributes, it will not be reported as changing the order can change the behavior.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-attributes: "error" */
</script>

<!-- ✓ GOOD -->
<div c d {...attrs} a b />

<!-- ✗ BAD -->
<div d c {...attrs} b a />
```

## :wrench: Options

```jsonc
{
  "svelte/sort-attributes": [
    "error",
    {
      "order": [
        // `this` property.
        "this",
        // `bind:this` directive.
        "bind:this",
        // `id` attribute.
        "id",
        // `name` attribute.
        "name",
        // `slot` attribute.
        "slot",
        // `--style-props` (Alphabetical order within the same group.)
        { "match": "/^--/u", "sort": "alphabetical" },
        // `style` attribute, and `style:` directives.
        ["style", "/^style:/u"],
        // `class` attribute.
        "class",
        // `class:` directives. (Alphabetical order within the same group.)
        { "match": "/^class:/u", "sort": "alphabetical" },
        // other attributes. (Alphabetical order within the same group.)
        {
          "match": ["!/:/u", "!/^(?:this|id|name|style|class)$/u", "!/^--/u"],
          "sort": "alphabetical"
        },
        // `bind:` directives (other then `bind:this`), and `on:` directives.
        ["/^bind:/u", "!bind:this", "/^on:/u"],
        // `use:` directives. (Alphabetical order within the same group.)
        { "match": "/^use:/u", "sort": "alphabetical" },
        // `transition:` directive.
        { "match": "/^transition:/u", "sort": "alphabetical" },
        // `in:` directive.
        { "match": "/^in:/u", "sort": "alphabetical" },
        // `out:` directive.
        { "match": "/^out:/u", "sort": "alphabetical" },
        // `animate:` directive.
        { "match": "/^animate:/u", "sort": "alphabetical" },
        // `let:` directives. (Alphabetical order within the same group.)
        { "match": "/^let:/u", "sort": "alphabetical" }
      ]
    }
  ]
}
```

- `order` ... Specify an array of your preferred attribute order. Array elements accept strings, string arrays, and objects.
  - String ... Specify the name or pattern of the attribute.
  - String array ... Specifies an array of the names or patterns of the attributes to be grouped. It will not be sorted within this same group.
  - Object ... Specifies an object with a definition for sorting within the same group.
    - `match` ... Specifies an array or string of the name or pattern of the attributes to be grouped.
    - `sort` ... Specify the sorting method. Currently, only `"alphabetical"` is supported.
      - `"alphabetical"` ... Sorts the attributes of the same group in alphabetical order.
      - `"ignore"` ... Attributes in the same group are not sorted.

Note that the behavior may change depending on how you specify the `order` setting.  
For example, `bind:value` and `on:input={() => console.log(value)}` behave differently depending on the order. See <https://svelte.dev/docs#template-syntax-element-directives-bind-property> for details.  
By default it is designed to be sorted safely.

You can use the following formats for names or patterns:

- `"foo"` ... Matches only the `foo` attribute name.
- `"/foo/"` ... Matches attribute names that match the `/foo/` regex. That is, it matches the attribute name including `foo`.
- `"!foo"` ... Exclude `foo` attribute from the matched attribute names. When used first in the array or alone, matches other than the `foo` attribute name.
- `"!/foo/"` ... Excludes attributes that match the `/foo/` regex from the matched attribute names. When used first in the array or alone, matches an attribute name that does not match the `/foo/` regex.
- `["style", "/^style:/u"]` ... Matches the `style` attribute or the attribute name that matches the `/^style:/u` regex.
- `["/^bind:/u", "!bind:this", "/^on:/u"]` ... Matches an attribute name that matches `/^bind:/u` and other than `bind:this`, or an attribute name that matches `/^on:/u`.

### `{ order: [ /*See below*/ ] }`

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-attributes: ["error", {
    "order": [
      "id",
      "class",
      "/^class:/u",
      "value",
      "src",
      "/^data-/u",
      "style",
      "/^style:/u",
      "/^on:/u",
      "/^use:/u",
      "/^animate:/u",
      "/^transition:/u",
      "/^in:/u",
      "/^out:/u",
      "bind:this",
      ["/^bind:/u", "!bind:this"],
      {
        "match": ["!/:/u", "!/^(?:id|class|value|src|style)$/u", "!/^data-/u"],
        "sort": "alphabetical"
      },
    ]
  }] */
</script>

<!-- ✓ GOOD -->
<MyComponent data-foo bind:this={comp} bind:data {abc} {def} />
<input
  id="foo"
  class="my-block"
  class:bar
  value="abc"
  data-value="x"
  style="width: 30px;"
  style:color
  animate:name
  transition:fn
  in:fn
  out:fn
  bind:this={foo}
/>
<img id="bar" {src} alt="bar" />

<!-- ✗ BAD -->
<MyComponent bind:data bind:this={comp} {abc} {def} data-foo />
<input
  class:bar
  class="my-block"
  id="foo"
  bind:this={foo}
  value="abc"
  style:color
  style="width: 30px;"
  data-value="x"
  animate:name
  in:fn
  out:fn
  transition:fn
/>
<img alt="bar" {src} id="bar" />
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v2.4.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/sort-attributes.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/sort-attributes.ts)
