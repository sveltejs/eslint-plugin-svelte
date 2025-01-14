# Introduction

`eslint-plugin-svelte` is the official [ESLint] plugin for [Svelte].  
It provides many unique check rules by using the template AST.  
You can check on the [Online DEMO](https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript).

> [!NOTE]
> This document is in development.\
> Please refer to the document for the version you are using.\
> For example, <https://github.com/sveltejs/eslint-plugin-svelte/blob/eslint-plugin-svelte%402.46.0/README.md>
> and <https://github.com/sveltejs/eslint-plugin-svelte/blob/eslint-plugin-svelte%402.46.0/docs>

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-svelte.svg)](https://www.npmjs.com/package/eslint-plugin-svelte)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-svelte.svg)](https://www.npmjs.com/package/eslint-plugin-svelte)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-svelte&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-svelte)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-svelte.svg)](http://www.npmtrends.com/eslint-plugin-svelte)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-svelte.svg)](http://www.npmtrends.com/eslint-plugin-svelte)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-svelte.svg)](http://www.npmtrends.com/eslint-plugin-svelte)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-svelte.svg)](http://www.npmtrends.com/eslint-plugin-svelte)
[![Build Status](https://github.com/sveltejs/eslint-plugin-svelte/workflows/CI/badge.svg?branch=main)](https://github.com/sveltejs/eslint-plugin-svelte/actions?query=workflow%3ACI)

[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fsveltejs%2Feslint-plugin-svelte%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/atlassian/changesets)

## :name_badge: What is this plugin?

[ESLint] plugin for [Svelte].  
It provides many unique check rules using the AST generated by [svelte-eslint-parser].

### ❗ Attention

#### Cannot be used with eslint-plugin-svelte3

The [svelte-eslint-parser] and the `eslint-plugin-svelte` can not be used with the [eslint-plugin-svelte3].

[svelte-eslint-parser]: https://github.com/sveltejs/svelte-eslint-parser
[eslint-plugin-svelte3]: https://github.com/sveltejs/eslint-plugin-svelte3

#### Experimental support for Svelte v5

We are working on support for Svelte v5, but it is still an experimental feature. Please note that rules and features related to Svelte v5 may be changed or removed in minor versions without notice.

<!--DOCS_IGNORE_START-->

## Versioning policy

This plugin follows [Semantic Versioning](https://semver.org/).  
However, unlike [ESLint’s Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy), this plugin adds new rules to its configs even in minor releases. For example, if you are using the recommended config, a minor update may add new rules, which could cause new lint errors in your project.  
While [ESLint’s Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy) only adds new rules to configs in major releases, most users (myself included) don’t regularly monitor new rules. This makes it challenging to manually add them to projects whenever they are introduced.  
By adding new rules to configs in minor releases, this plugin ensures users can adopt them more easily. If any new rules cause issues, you can simply disable them. I believe this approach helps maintain and improve code quality with minimal effort.

## Migration Guide

To migrate from `eslint-plugin-svelte` v1, or [`@ota-meshi/eslint-plugin-svelte`](https://www.npmjs.com/package/@ota-meshi/eslint-plugin-svelte), please refer to the [migration guide](https://sveltejs.github.io/eslint-plugin-svelte/migration/).

## :book: Documentation

See [documents](https://sveltejs.github.io/eslint-plugin-svelte/).

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-svelte svelte
```

> **Requirements**
>
> - ESLint v8.57.1, v9.0.0 and above
> - Node.js v18.20.4, v20.18.0, v22.10.0 and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import eslintPluginSvelte from 'eslint-plugin-svelte';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginSvelte.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      // 'svelte/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `eslintPluginSvelte.configs.base` ... Configuration to enable correct Svelte parsing.
- `eslintPluginSvelte.configs.recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `eslintPluginSvelte.configs.prettier` ... Turns off rules that may conflict with [Prettier](https://prettier.io/) (You still need to configure prettier to work with svelte yourself, for example by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).).
- `eslintPluginSvelte.configs.all` ... All rules. This configuration is not recommended for production use because it changes with every minor and major version of `eslint-plugin-svelte`. Use it at your own risk.

See [the rule list](https://sveltejs.github.io/eslint-plugin-svelte/rules/) to get the `rules` that this plugin provides.

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.svelte`.

For example, if you are using the `"@typescript-eslint/parser"`, and if you want to use TypeScript in `<script>` of `.svelte`, you need to add more `parserOptions` configuration.

```js
import eslintPluginSvelte from 'eslint-plugin-svelte';
import * as svelteParser from 'svelte-eslint-parser';
import * as typescriptParser from '@typescript-eslint/parser';
export default [
  ...js.configs.recommended,
  ...eslintPluginSvelte.configs.recommended,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: typescriptParser,
        project: './path/to/your/tsconfig.json',
        extraFileExtensions: ['.svelte']
      }
    }
  }
];
```

If you have a mix of TypeScript and JavaScript in your project, use a multiple parser configuration.

```js
import eslintPluginSvelte from 'eslint-plugin-svelte';
import * as svelteParser from 'svelte-eslint-parser';
import * as typescriptParser from '@typescript-eslint/parser';
import espree from 'espree';
export default [
  ...js.configs.recommended,
  ...eslintPluginSvelte.configs.recommended,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: {
          // Specify a parser for each lang.
          ts: typescriptParser,
          js: espree,
          typescript: typescriptParser
        },
        project: './path/to/your/tsconfig.json',
        extraFileExtensions: ['.svelte']
      }
    }
  }
];
```

See also <https://github.com/sveltejs/svelte-eslint-parser#readme>.

::: warning ❗ Attention

The TypeScript parser uses a singleton internally and it will only use the
options given to it when it was first initialized. If trying to change the
options for a different file or override, the parser will simply ignore the new
options (which may result in an error). See
[typescript-eslint/typescript-eslint#6778](https://github.com/typescript-eslint/typescript-eslint/issues/6778)
for some context.

:::

#### Specify `svelte.config.js`

If you are using `eslint.config.js`, we recommend that you import and specify `svelte.config.js`.
By specifying it, some rules of `eslint-plugin-svelte` will read it and try to behave well for you by default.
Some Svelte configurations will be statically loaded from `svelte.config.js` even if you don't specify it, but you need to specify it to make it work better.

Example **eslint.config.js**:

```js
import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';
export default [
  ...eslintPluginSvelte.configs.recommended,
  {
    files: [
      '**/*.svelte',
      '*.svelte'
      // Add more files if you need.
      // '**/*.svelte.ts', '*.svelte.ts', '**/*.svelte.js', '*.svelte.js',
    ],
    languageOptions: {
      parserOptions: {
        // Specify the `svelte.config.js`.
        svelteConfig
      }
    }
  }
];
```

#### settings.svelte

You can change the behavior of this plugin with some settings.

e.g.

```js
export default [
  // ...
  {
    settings: {
      svelte: {
        ignoreWarnings: [
          '@typescript-eslint/no-unsafe-assignment',
          '@typescript-eslint/no-unsafe-member-access'
        ],
        compileOptions: {
          postcss: {
            configFilePath: './path/to/my/postcss.config.js'
          }
        },
        kit: {
          files: {
            routes: 'src/routes'
          }
        }
      }
    }
  }
  // ...
];
```

#### settings.svelte.ignoreWarnings

Specifies an array of rules that ignore reports in the template.  
For example, set rules on the template that cannot avoid false positives.

#### settings.svelte.compileOptions

Specifies options for Svelte compile. Effects rules that use Svelte compile. The target rules are [svelte/valid-compile](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile/) and [svelte/no-unused-svelte-ignore](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-svelte-ignore/). **Note that it has no effect on ESLint's custom parser**.

- `postcss` ... Specifies options related to PostCSS. You can disable the PostCSS process by specifying `false`.
  - `configFilePath` ... Specifies the path of the directory containing the PostCSS configuration.

#### settings.svelte.kit

::: warning

Even if you don't specify `settings.svelte.kit`, the rules will try to load information from `svelte.config.js`, so specify `settings.svelte.kit` if the default doesn't work.

:::

If you use SvelteKit with not default configuration, you need to set below configurations.
The schema is subset of SvelteKit's configuration.
Therefore please check [SvelteKit docs](https://kit.svelte.dev/docs/configuration) for more details.

e.g.

```js
export default [
  // ...
  {
    settings: {
      svelte: {
        kit: {
          files: {
            routes: 'src/routes'
          }
        }
      }
    }
  }
  // ...
];
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

<!-- prettier-ignore-start -->
<!--RULES_SECTION_START-->

:wrench: Indicates that the rule is fixable, and using `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the reported problems.  
:bulb: Indicates that some problems reported by the rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).  
:star: Indicates that the rule is included in the `plugin:svelte/recommended` config.

<!--RULES_TABLE_START-->

## Possible Errors

These rules relate to possible syntax or logic errors in Svelte code:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/infinite-reactive-loop](https://sveltejs.github.io/eslint-plugin-svelte/rules/infinite-reactive-loop/) | Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent. |  |
| [svelte/no-dom-manipulating](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dom-manipulating/) | disallow DOM manipulating |  |
| [svelte/no-dupe-else-if-blocks](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-else-if-blocks/) | disallow duplicate conditions in `{#if}` / `{:else if}` chains | :star: |
| [svelte/no-dupe-on-directives](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-on-directives/) | disallow duplicate `on:` directives |  |
| [svelte/no-dupe-style-properties](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-style-properties/) | disallow duplicate style properties | :star: |
| [svelte/no-dupe-use-directives](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-use-directives/) | disallow duplicate `use:` directives |  |
| [svelte/no-dynamic-slot-name](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dynamic-slot-name/) | disallow dynamic slot name | :star::wrench: |
| [svelte/no-not-function-handler](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-not-function-handler/) | disallow use of not function in event handler | :star: |
| [svelte/no-object-in-text-mustaches](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-object-in-text-mustaches/) | disallow objects in text mustache interpolation | :star: |
| [svelte/no-raw-special-elements](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-raw-special-elements/) | Checks for invalid raw HTML elements | :wrench: |
| [svelte/no-reactive-reassign](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-reassign/) | disallow reassigning reactive values |  |
| [svelte/no-shorthand-style-property-overrides](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-shorthand-style-property-overrides/) | disallow shorthand style properties that override related longhand properties | :star: |
| [svelte/no-store-async](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-store-async/) | disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features |  |
| [svelte/no-unknown-style-directive-property](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unknown-style-directive-property/) | disallow unknown `style:property` | :star: |
| [svelte/require-store-callbacks-use-set-param](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-callbacks-use-set-param/) | store callbacks must use `set` param |  |
| [svelte/require-store-reactive-access](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-reactive-access/) | disallow to use of the store itself as an operand. Need to use $ prefix or get function. | :wrench: |
| [svelte/valid-compile](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile/) | disallow warnings when compiling. | :star: |

## Security Vulnerability

These rules relate to security vulnerabilities in Svelte code:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/no-at-html-tags](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-html-tags/) | disallow use of `{@html}` to prevent XSS attack | :star: |
| [svelte/no-target-blank](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-target-blank/) | disallow `target="_blank"` attribute without `rel="noopener noreferrer"` |  |

## Best Practices

These rules relate to better ways of doing things to help you avoid problems:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/block-lang](https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang/) | disallows the use of languages other than those specified in the configuration for the lang attribute of `<script>` and `<style>` blocks. | :bulb: |
| [svelte/button-has-type](https://sveltejs.github.io/eslint-plugin-svelte/rules/button-has-type/) | disallow usage of button without an explicit type attribute |  |
| [svelte/no-at-debug-tags](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-debug-tags/) | disallow the use of `{@debug}` | :star: |
| [svelte/no-ignored-unsubscribe](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-ignored-unsubscribe/) | disallow ignoring the unsubscribe method returned by the `subscribe()` on Svelte stores. |  |
| [svelte/no-immutable-reactive-statements](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-immutable-reactive-statements/) | disallow reactive statements that don't reference reactive values. |  |
| [svelte/no-inline-styles](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inline-styles/) | disallow attributes and directives that produce inline styles |  |
| [svelte/no-inspect](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inspect/) | Warns against the use of `$inspect` directive |  |
| [svelte/no-reactive-functions](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-functions/) | it's not necessary to define functions in reactive statements | :bulb: |
| [svelte/no-reactive-literals](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-literals/) | don't assign literal values in reactive statements | :bulb: |
| [svelte/no-svelte-internal](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-svelte-internal/) | svelte/internal will be removed in Svelte 6. |  |
| [svelte/no-unused-class-name](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-class-name/) | disallow the use of a class in the template without a corresponding style |  |
| [svelte/no-unused-svelte-ignore](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-svelte-ignore/) | disallow unused svelte-ignore comments | :star: |
| [svelte/no-useless-children-snippet](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-children-snippet/) | disallow explicit children snippet where it's not needed |  |
| [svelte/no-useless-mustaches](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/) | disallow unnecessary mustache interpolations | :wrench: |
| [svelte/prefer-const](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-const/) | Require `const` declarations for variables that are never reassigned after declared | :wrench: |
| [svelte/prefer-destructured-store-props](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-destructured-store-props/) | destructure values from object stores for better change tracking & fewer redraws | :bulb: |
| [svelte/require-each-key](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-each-key/) | require keyed `{#each}` block |  |
| [svelte/require-event-dispatcher-types](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-dispatcher-types/) | require type parameters for `createEventDispatcher` |  |
| [svelte/require-optimized-style-attribute](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-optimized-style-attribute/) | require style attributes that can be optimized |  |
| [svelte/require-stores-init](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-stores-init/) | require initial value in store |  |
| [svelte/valid-each-key](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-each-key/) | enforce keys to use variables defined in the `{#each}` block |  |

## Stylistic Issues

These rules relate to style guidelines, and are therefore quite subjective:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/derived-has-same-inputs-outputs](https://sveltejs.github.io/eslint-plugin-svelte/rules/derived-has-same-inputs-outputs/) | derived store should use same variable names between values and callback |  |
| [svelte/first-attribute-linebreak](https://sveltejs.github.io/eslint-plugin-svelte/rules/first-attribute-linebreak/) | enforce the location of first attribute | :wrench: |
| [svelte/html-closing-bracket-new-line](https://sveltejs.github.io/eslint-plugin-svelte/rules/html-closing-bracket-new-line/) | Require or disallow a line break before tag's closing brackets | :wrench: |
| [svelte/html-closing-bracket-spacing](https://sveltejs.github.io/eslint-plugin-svelte/rules/html-closing-bracket-spacing/) | require or disallow a space before tag's closing brackets | :wrench: |
| [svelte/html-quotes](https://sveltejs.github.io/eslint-plugin-svelte/rules/html-quotes/) | enforce quotes style of HTML attributes | :wrench: |
| [svelte/html-self-closing](https://sveltejs.github.io/eslint-plugin-svelte/rules/html-self-closing/) | enforce self-closing style | :wrench: |
| [svelte/indent](https://sveltejs.github.io/eslint-plugin-svelte/rules/indent/) | enforce consistent indentation | :wrench: |
| [svelte/max-attributes-per-line](https://sveltejs.github.io/eslint-plugin-svelte/rules/max-attributes-per-line/) | enforce the maximum number of attributes per line | :wrench: |
| [svelte/mustache-spacing](https://sveltejs.github.io/eslint-plugin-svelte/rules/mustache-spacing/) | enforce unified spacing in mustache | :wrench: |
| [svelte/no-extra-reactive-curlies](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-extra-reactive-curlies/) | disallow wrapping single reactive statements in curly braces | :bulb: |
| [svelte/no-restricted-html-elements](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-restricted-html-elements/) | disallow specific HTML elements |  |
| [svelte/no-spaces-around-equal-signs-in-attribute](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-spaces-around-equal-signs-in-attribute/) | disallow spaces around equal signs in attribute | :wrench: |
| [svelte/prefer-class-directive](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-class-directive/) | require class directives instead of ternary expressions | :wrench: |
| [svelte/prefer-style-directive](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-style-directive/) | require style directives instead of style attribute | :wrench: |
| [svelte/shorthand-attribute](https://sveltejs.github.io/eslint-plugin-svelte/rules/shorthand-attribute/) | enforce use of shorthand syntax in attribute | :wrench: |
| [svelte/shorthand-directive](https://sveltejs.github.io/eslint-plugin-svelte/rules/shorthand-directive/) | enforce use of shorthand syntax in directives | :wrench: |
| [svelte/sort-attributes](https://sveltejs.github.io/eslint-plugin-svelte/rules/sort-attributes/) | enforce order of attributes | :wrench: |
| [svelte/spaced-html-comment](https://sveltejs.github.io/eslint-plugin-svelte/rules/spaced-html-comment/) | enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment | :wrench: |

## Extension Rules

These rules extend the rules provided by ESLint itself, or other plugins to work well in Svelte:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/no-inner-declarations](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inner-declarations/) | disallow variable or `function` declarations in nested blocks | :star: |
| [svelte/no-trailing-spaces](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-trailing-spaces/) | disallow trailing whitespace at the end of lines | :wrench: |

## SvelteKit

These rules relate to SvelteKit and its best Practices.

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/no-export-load-in-svelte-module-in-kit-pages](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-export-load-in-svelte-module-in-kit-pages/) | disallow exporting load functions in `*.svelte` module in SvelteKit page components. |  |
| [svelte/no-navigation-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-base/) | disallow using navigation (links, goto, pushState, replaceState) without the base path |  |
| [svelte/valid-prop-names-in-kit-pages](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-prop-names-in-kit-pages/) | disallow props other than data or errors in SvelteKit page components. |  |

## Experimental

:warning: These rules are considered experimental and may change or be removed in the future:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/experimental-require-slot-types](https://sveltejs.github.io/eslint-plugin-svelte/rules/experimental-require-slot-types/) | require slot type declaration using the `$$Slots` interface |  |
| [svelte/experimental-require-strict-events](https://sveltejs.github.io/eslint-plugin-svelte/rules/experimental-require-strict-events/) | require the strictEvents attribute on `<script>` tags |  |

## System

These rules relate to this plugin works:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/comment-directive](https://sveltejs.github.io/eslint-plugin-svelte/rules/comment-directive/) | support comment-directives in HTML template | :star: |
| [svelte/system](https://sveltejs.github.io/eslint-plugin-svelte/rules/system/) | system rule for working this plugin | :star: |

## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
| [svelte/@typescript-eslint/no-unnecessary-condition](https://sveltejs.github.io/eslint-plugin-svelte/rules/@typescript-eslint/no-unnecessary-condition/) | This rule is no longer needed when using svelte-eslint-parser>=v0.19.0. |
| [svelte/no-goto-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-goto-without-base/) | [svelte/no-navigation-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-base/) |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->
<!-- prettier-ignore-end -->

<!--DOCS_IGNORE_START-->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

See also [CONTRIBUTING.md](./CONTRIBUTING.md)

### Working With Rules

This plugin uses [svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) for the parser. Check [here](https://sveltejs.github.io/svelte-eslint-parser/) to find out about AST.

<!--DOCS_IGNORE_END-->

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[svelte]: https://svelte.dev/
[eslint]: https://eslint.org/
