# Migration Guide

## From `eslint-plugin-svelte3`

You can not use both `eslint-plugin-svelte3` and `eslint-plugin-svelte` at same time.
So before start to use this plugin, you need to remove `eslint-plugin-svelte3`'s stuff from both `package.json` and `.eslintrc.*`.

> Note: If you want to know difference between `eslint-plugin-svelte` and `eslint-plugin-svelte3`, Please read the reason for deprecating `eslint-plugin-svelte3` in [eslint-plugin-svelte3 README](https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/README.md).

> Note: If you're using TypeScript, maybe you get `Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser.` error at some configuration files.<br>In this case, please refer [this GitHub comment](https://github.com/typescript-eslint/typescript-eslint/issues/1723#issuecomment-626766041) to solve it.

## From `eslint-plugin-svelte` v1 To v2

`eslint-plugin-svelte` v1 was an alias for [eslint-plugin-svelte3], but `eslint-plugin-svelte` v2 is now an independent eslint-plugin.

If you want the previous behavior, replace it with [eslint-plugin-svelte3].

[eslint-plugin-svelte3]: https://github.com/sveltejs/eslint-plugin-svelte3

## From `@ota-meshi/eslint-plugin-svelte`

`@ota-meshi/eslint-plugin-svelte` has been renamed to `eslint-plugin-svelte`.\
Therefore, you need to replace the package name, and the presets, rules, and settings specified in the configuration.

- `package.json`\
  Replace the package name.

  ```diff
  -  "@ota-meshi/eslint-plugin-svelte": "^0.X.X"
  +  "eslint-plugin-svelte": "^X.X.X"
  ```

- `.eslintrc.*`\
  Replace `@ota-meshi/svelte` with `svelte` as a string.\
  Examples:

  - Presets

    ```diff
      "extends": [
    -    "plugin:@ota-meshi/svelte/recommended"
    +    "plugin:svelte/recommended"
      ],
    ```

  - Rules

    ```diff
      "rules": {
    -    "@ota-meshi/svelte/no-dupe-else-if-blocks": "error",
    +    "svelte/no-dupe-else-if-blocks": "error",
    -    "@ota-meshi/svelte/button-has-type": "error",
    +    "svelte/button-has-type": "error",
      },
    ```

  - `settings`

    ```diff
      "settings": {
    -    "@ota-meshi/svelte": { ... }
    +    "svelte": { ... }
      },
    ```
