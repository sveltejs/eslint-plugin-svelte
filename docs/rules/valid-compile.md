---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/valid-compile'
description: 'disallow warnings when compiling.'
since: 'v0.7.0'
---

# svelte/valid-compile

> disallow warnings when compiling.

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule uses Svelte compiler to check the source code.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-compile: "error" */
  let src = 'tutorial/image.gif';
</script>

<!-- ✓ GOOD -->
<img {src} alt="Rick Astley dances." />

<!-- ✗ BAD -->
<img {src} />
```

Note that we exclude reports for some checks, such as `missing-declaration`, and `dynamic-slot-name`, which you can check with different ESLint rules.

### Using `svelte.config.js`

If you want to suppress messages using [`onwarn` like `vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#onwarn), Use `eslint.config.js` and specify the information in `svelte.config.js` in your parser configuration.

```js
import svelteConfig from './svelte.config.js';
export default [
  // ...
  {
    files: ['**/*.svelte', '*.svelte'],
    languageOptions: {
      parserOptions: {
        svelteConfig: svelteConfig
      }
    }
  }
];
```

See also [User Guide > Specify `svelte.config.js`](../user-guide.md#specify-svelte-config-js)

#### onwarn

This rule can use [`onwarn` like `vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#onwarn).

Example:

```js
// svelte.config.js
export default {
  onwarn: (warning, handler) => {
    if (warning.code === 'a11y-distracting-elements') return;
    if (warning.code === 'a11y_distracting_elements') return; // for Svelte v5

    handler(warning);
  }
};
```

## :wrench: Options

```json
{
  "svelte/valid-compile": [
    "error",
    {
      "ignoreWarnings": false
    }
  ]
}
```

- `ignoreWarnings` ... If set to `true`, ignores any warnings other than fatal errors reported by the svelte compiler.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/valid-compile: ["error", { ignoreWarnings: true }] */
  let src = 'tutorial/image.gif';
</script>

<!-- Ignore -->
<img {src} />
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v0.7.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/valid-compile.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/valid-compile.ts)
