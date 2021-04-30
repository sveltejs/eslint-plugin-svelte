# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint @ota-meshi/eslint-plugin-svelte
```

::: tip Requirements

- ESLint v7.0.0 and above
- Node.js v10.13.0 and above

:::

## :book: Usage

<!--USAGE_GUIDE_START-->

### Configuration

Use `.eslintrc.*` file to configure rules. See also: [https://eslint.org/docs/user-guide/configuring](https://eslint.org/docs/user-guide/configuring).

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rule sets here, such as:
    // 'eslint:recommended',
    "plugin:@ota-meshi/svelte/recommended",
  ],
  rules: {
    // override/add rules settings here, such as:
    // '@ota-meshi/svelte/rule-name': 'error'
  },
}
```

This plugin provides configs:

- `plugin:@ota-meshi/svelte/base` ... Configuration to enable correct Svelte parsing.
- `plugin:@ota-meshi/svelte/recommended` ... Above, plus rules to prevent errors or unintended behavior.

See [the rule list](../rules/README.md) to get the `rules` that this plugin provides.

::: warning ❗ Attention

The `@ota-meshi/eslint-plugin-svelte` can not be used with the [eslint-plugin-svelte3].
If you are using [eslint-plugin-svelte3] you need to remove it.

```diff
  "plugins": [
-   "svelte3"
  ]
```

:::

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.svelte` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.svelte src
eslint "src/**/*.{js,svelte}"
```

## :computer: Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.svelte` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "svelte"]
}
```

<!--USAGE_GUIDE_END-->

## :question: FAQ

- TODO

[eslint-plugin-svelte3]: https://github.com/sveltejs/eslint-plugin-svelte3
