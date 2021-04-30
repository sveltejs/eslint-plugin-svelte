# Introduction

`@ota-meshi/eslint-plugin-svelte` is ESLint plugin for Svelte using AST.  
You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-svelte/playground/).

::: **_WORKS IN PROGRESS_** :::

::: **_This Parser is still in an EXPERIMENTAL STATE_** :::

[![NPM license](https://img.shields.io/npm/l/@ota-meshi/eslint-plugin-svelte.svg)](https://www.npmjs.com/package/@ota-meshi/eslint-plugin-svelte)
[![NPM version](https://img.shields.io/npm/v/@ota-meshi/eslint-plugin-svelte.svg)](https://www.npmjs.com/package/@ota-meshi/eslint-plugin-svelte)

## :name_badge: What is this plugin?

An experimental ESLint plugin using [svelte-eslint-parser].

### ❓ Why?

[Svelte] has the official ESLint plugin the [eslint-plugin-svelte3]. The [eslint-plugin-svelte3] works well enough to check scripts. However, it does not handle the AST of the template, which makes it very difficult for third parties to create their own the [ESLint] rules for the [Svelte].

The [svelte-eslint-parser] aims to make it easy to create your own rules for the [Svelte] by allowing the template AST to be used in the rules.

### ❗ Attention

The [svelte-eslint-parser] and the `@ota-meshi/eslint-plugin-svelte` can not be used with the [eslint-plugin-svelte3].

[svelte-eslint-parser]: https://www.npmjs.com/package/svelte-eslint-parser
[eslint-plugin-svelte3]: https://github.com/sveltejs/eslint-plugin-svelte3
[eslint]: https://eslint.org/

<!--DOCS_IGNORE_START-->

## :book: Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-svelte/).

## :cd: Installation

```bash
npm install --save-dev eslint @ota-meshi/eslint-plugin-svelte
```

> **Requirements**
>
> - ESLint v7.0.0 and above
> - Node.js v10.13.0 and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->
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

See [the rule list](https://ota-meshi.github.io/eslint-plugin-svelte/rules/) to get the `rules` that this plugin provides.

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
<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the configs.

<!--RULES_TABLE_START-->

| Rule ID | Description |    |
|:--------|:------------|:---|
| [@ota-meshi/svelte/no-at-debug-tags](https://ota-meshi.github.io/eslint-plugin-svelte/rules/no-at-debug-tags.html) | disallow the use of `{@debug}` | :star: |
| [@ota-meshi/svelte/no-at-html-tags](https://ota-meshi.github.io/eslint-plugin-svelte/rules/no-at-html-tags.html) | disallow use of `{@html}` to prevent XSS attack | :star: |
| [@ota-meshi/svelte/no-dupe-else-if-blocks](https://ota-meshi.github.io/eslint-plugin-svelte/rules/no-dupe-else-if-blocks.html) | disallow duplicate conditions in `{#if}` / `{:else if}` chains | :star: |
| [@ota-meshi/svelte/prefer-class-directive](https://ota-meshi.github.io/eslint-plugin-svelte/rules/prefer-class-directive.html) | require class directives instead of ternary expressions | :wrench: |
| [@ota-meshi/svelte/spaced-html-comment](https://ota-meshi.github.io/eslint-plugin-svelte/rules/spaced-html-comment.html) | enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment | :wrench: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

<!--DOCS_IGNORE_START-->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run update` runs in order to update readme and recommended configuration.

### Working With Rules

This plugin uses [svelte-eslint-parser](https://github.com/ota-meshi/svelte-eslint-parser) for the parser. Check [here](https://ota-meshi.github.io/svelte-eslint-parser/) to find out about AST.

<!--DOCS_IGNORE_END-->

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[svelte]: https://svelte.dev/
