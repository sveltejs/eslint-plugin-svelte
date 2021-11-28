---
pageClass: "rule-details"
sidebarDepth: 0
title: "@ota-meshi/svelte/mustache-spacing"
description: "enforce unified spacing in mustache"
---

# @ota-meshi/svelte/mustache-spacing

> enforce unified spacing in mustache

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule aims at enforcing unified spacing in mustaches.

<eslint-code-block fix>

<!-- prettier-ignore-start -->
<!--eslint-skip-->

```svelte
<script>
  /* eslint @ota-meshi/svelte/mustache-spacing: "error" */
</script>

<!-- ✓ GOOD -->
{name}
<input bind:value={text} class="foo {bar}" />
<input {id} {...attrs} />
{@html page}
{@debug o1, o2}

{#if c1}...{:else if c2}...{:else}...{/if}

{#each list as item}...{/each}

{#await p}...{:then val}...{:catch err}...{/await}

{#key id}...{/key}

<!-- ✗ BAD -->
{ name }
<input bind:value={ text } class="foo { bar }" />
<input { id } { ...attrs } />
{ @html page }
{ @debug o1, o2 }

{ #if c1 }...{ :else if c2 }...{ :else }...{ /if }

{ #each list as item }...{ /each }

{ #await p }...{ :then val }...{ :catch err }...{ /await }

{ #key id }...{ /key }
```

</eslint-code-block>

<!-- prettier-ignore-end -->

## :wrench: Options

```json
{
  "@ota-meshi/svelte/mustache-spacing": [
    "error",
    {
      "textExpressions": "never", // or "always"
      "attributesAndProps": "never", // or "always"
      "directiveExpressions": "never", // or "always"
      "tags": {
        "openingBrace": "never", // or "always"
        "closingBrace": "never" // or "always" or "always-after-expression"
      }
    }
  ]
}
```

- `"never"` ... Expect one space between token and curly brackets. This is default.
- `"always"` ... Expect no spaces between token and curly brackets. This is default.
- `"always-after-expression"` ... Expect one space between expression and closing curly brackets, if the expression before the closing curly bracket.
- `textExpressions` ... Enforces the style of the mustache for the text expressions. e.g. `{text}`.
- `attributesAndProps` ... Enforces the style of the mustache for the attributes and props. e.g. `<input value={text}`.
- `directiveExpressions` ... Enforces the style of the mustache for the directive expressions. e.g. `<input bind:value={text}`.
- `tags` ... Enforces the style of the mustache for the mustache tags. e.g. `{#if condition}`.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/mustache-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/mustache-spacing.ts)
