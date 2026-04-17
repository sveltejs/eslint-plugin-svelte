---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/sort-props'
description: 'enforce grouped order of props and directives'
since: 'v3.18.0'
---

# svelte/sort-props

> enforce grouped order of props and directives

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces grouping and sorting for Svelte props/directives.

> :warning: Do not enable `svelte/sort-props` together with `svelte/sort-attributes`.
> Both rules reorder props/attributes and can produce overlapping or conflicting diagnostics/fixes.
> Prefer `svelte/sort-props` when you need group-aware sorting by directive type.

By default it sorts inside spread-separated partitions and never moves props across spread attributes.

Default group order:

- `class-directive`
- `style-directive`
- `bind-directive`
- `shorthand-attribute`
- `attribute`
- `unknown`
- `on-directive`
- `use-directive`
- `transition-directive`
- `in-directive`
- `out-directive`
- `animate-directive`
- `let-directive`
- `attach-tag`
- `special-directive`

### Event Syntax in Svelte 5

In Svelte 5, DOM events are usually event attributes like `onclick` instead of directives like `on:click`.

- `onclick` is treated as an `attribute`.
- `on:click` is treated as an `on-directive` (legacy syntax, still supported).
- Avoid mixing `onclick`-style attributes and `on:` directives in the same component. Svelte warns about mixed event handler syntaxes.

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-props: "error" */
</script>

<!-- ✓ GOOD -->
<button
  class:active={active}
  aria-label="save"
  disabled={disabled}
  onclick={save}
/>
<input a="1" b="2" {...rest} c="3" d="4" />

<!-- ✗ BAD -->
<button
  aria-label="save"
  onclick={save}
  class:active={active}
  disabled={disabled}
/>
<input b="2" a="1" {...rest} d="4" c="3" />
```

<!-- prettier-ignore-end -->

Legacy `on:` directives are still supported, but keep them in components that do not also use `onclick`-style attributes:

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-props: "error" */
</script>

<!-- ✓ GOOD -->
<FancyInput bind:value={value} on:commit={legacyHandler} />

<!-- ✗ BAD -->
<FancyInput on:commit={legacyHandler} bind:value={value} />
```

<!-- prettier-ignore-end -->

## :wrench: Options

```json
{
  "svelte/sort-props": [
    "error",
    {
      "type": "alphabetical",
      "order": "asc",
      "ignoreCase": true,
      "groups": [
        "class-directive",
        "style-directive",
        "bind-directive",
        "shorthand-attribute",
        "attribute",
        "unknown",
        "on-directive"
      ],
      "customGroups": [
        {
          "groupName": "important-attribute",
          "selector": "attribute",
          "elementNamePattern": "/^(?:id|name)$/u"
        }
      ]
    }
  ]
}
```

- `type`: `alphabetical` | `natural` | `line-length` | `unsorted`.
- `order`: `asc` | `desc`.
- `groups`: group order list. You can also use `{ "group": "...", ...overrides }`.
- `customGroups`: matcher-based groups with `groupName` and optional `selector`, `modifiers`, `elementNamePattern`, `elementValuePattern`.
- `fallbackSort`: secondary comparison when primary keys are equal.

### Example: Custom Group for Svelte 5 Event Attributes

If you want all `on*` event attributes (for example `onclick`, `oninput`) in a dedicated group:

```json
{
  "svelte/sort-props": [
    "error",
    {
      "groups": ["event-attribute", "attribute", "bind-directive", "on-directive"],
      "customGroups": [
        {
          "groupName": "event-attribute",
          "selector": "attribute",
          "elementNamePattern": "/^on[a-z]/u"
        }
      ]
    }
  ]
}
```

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-props: ["error", {
    "groups": ["event-attribute", "attribute", "bind-directive", "on-directive"],
    "customGroups": [{
      "groupName": "event-attribute",
      "selector": "attribute",
      "elementNamePattern": "/^on[a-z]/u"
    }]
  }] */
</script>

<!-- ✓ GOOD -->
<input onclick={save} oninput={trackInput} aria-label="save" bind:value={value} />

<!-- ✗ BAD -->
<input aria-label="save" onclick={save} oninput={trackInput} bind:value={value} />
```

<!-- prettier-ignore-end -->

### Example: Group-level Sort Override

You can set a global sort mode and override one group:

```json
{
  "svelte/sort-props": [
    "error",
    {
      "type": "alphabetical",
      "groups": [
        { "group": "bind-directive", "type": "line-length", "order": "desc" },
        "attribute"
      ]
    }
  ]
}
```

This keeps `attribute` alphabetical while sorting `bind-directive` by line length.

### Common Pitfalls

- In Svelte 5, `onclick` is an `attribute`, not an `on-directive`. With the default order, `bind-directive` comes before `attribute`, so `bind:value` should appear before `onclick`.
- Spread attributes (`{...props}`) split sorting partitions. Props on different sides of a spread are not reordered across it.
- `customGroups` only changes grouping, not matching order between partitions.
- If both group and global options define sort behavior, group-level overrides win for that group.

### Real-world Example: Search Form Component

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-props: ["error", {
    "groups": [
      "important-attribute",
      "attribute",
      "bind-directive",
      "on-directive"
    ],
    "customGroups": [{
      "groupName": "important-attribute",
      "selector": "attribute",
      "elementNamePattern": "/^(?:id|name|type)$/u"
    }]
  }] */
</script>

<!-- ✓ GOOD -->
<input
  id="user-search"
  name="keyword"
  type="search"
  aria-label="Search users"
  onclick={trackFocus}
  oninput={trackInput}
  bind:value={keyword}
/>

<!-- ✗ BAD -->
<input
  bind:value={keyword}
  aria-label="Search users"
  id="user-search"
  name="keyword"
  type="search"
  onclick={trackFocus}
  oninput={trackInput}
/>
```

<!-- prettier-ignore-end -->

### Real-world Example: Card Action Area With Spread

When forwarding props from parent components, each spread-separated partition is checked independently.

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/sort-props: "error" */
</script>

<!-- ✓ GOOD -->
<button
  aria-label="Open profile"
  disabled={disabled}
  onclick={openProfile}
  {...restButtonProps}
  data-track="profile"
  onmouseenter={trackHover}
/>

<!-- ✗ BAD -->
<button
  aria-label="Open profile"
  onclick={openProfile}
  disabled={disabled}
  {...restButtonProps}
  data-track="profile"
  onmouseenter={trackHover}
/>
```

<!-- prettier-ignore-end -->

### Selectors

- `class-directive`
- `style-directive`
- `bind-directive`
- `shorthand-attribute`
- `attribute`
- `special-directive`
- `attach-tag`
- `on-directive`
- `use-directive`
- `transition-directive`
- `in-directive`
- `out-directive`
- `animate-directive`
- `let-directive`
- `ref-directive`
- `directive`

### Modifiers

- `shorthand`
- `multiline`

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.18.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/sort-props.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/sort-props.ts)
