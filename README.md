<!--DOCS_IGNORE_START-->

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

<div align="center">

# eslint-plugin-svelte

## ESLint plugin for Svelte using AST

[Live Demo](https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript) •
[Documentation](https://sveltejs.github.io/eslint-plugin-svelte/) •
[Discord](https://svelte.dev/chat)

</div>

<!--DOCS_IGNORE_END-->

## Introduction

`eslint-plugin-svelte` is the official [ESLint](https://eslint.org/) plugin for [Svelte](https://svelte.dev/).  
It leverages the AST generated by [svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) to provide custom linting for Svelte.  
Note that `eslint-plugin-svelte` and `svelte-eslint-parser` cannot be used alongside [eslint-plugin-svelte3](https://github.com/sveltejs/eslint-plugin-svelte3).

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

## Installation

```bash
npm install --save-dev svelte eslint eslint-plugin-svelte globals
```

> [!NOTE]
>
> **Requirements:**
>
> - ESLint v8.57.1, v9.0.0, and above
> - Node.js v18.20.4, v20.18.0, v22.10.0, and above

## Usage

Use the `eslint.config.js` file to configure rules. For more details, see the [ESLint documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new).

### Configuration

#### JavaScript project

```js
// eslint.config.js
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node // Add this if you are using SvelteKit in non-SPA mode
      }
    }
  },
  {
    files: [
      '*.svelte',
      '**/*.svelte',
      '*.svelte.ts',
      '**/*.svelte.ts',
      '*.svelte.js',
      '**/*.svelte.js'
    ],
    languageOptions: {
      parserOptions: {
        // We recommend importing and specifying svelte.config.js.
        // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
        // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
        // explicitly specifying it ensures better compatibility and functionality.
        svelteConfig
      }
    }
  },
  {
    rules: {
      // Override or add rule settings here, such as:
      // 'svelte/rule-name': 'error'
    }
  }
];
```

#### TypeScript project

```shell
npm install --save-dev typescript-eslint
```

```js
// eslint.config.js
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['*.svelte', '**/*.svelte'],
    // See more details at: https://typescript-eslint.io/packages/parser/
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
        parser: ts.parser
        // Specify a parser for each language, if needed:
        // parser: {
        //   ts: ts.parser,
        //   js: espree,    // Use espree for .js files (add: import espree from 'espree')
        //   typescript: ts.parser
        // },
      }
    }
  },
  {
    files: [
      '*.svelte',
      '**/*.svelte',
      '*.svelte.ts',
      '**/*.svelte.ts',
      '*.svelte.js',
      '**/*.svelte.js'
    ],
    languageOptions: {
      parserOptions: {
        // We recommend importing and specifying svelte.config.js.
        // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
        // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
        // explicitly specifying it ensures better compatibility and functionality.
        svelteConfig
      }
    }
  },
  {
    rules: {
      // Override or add rule settings here, such as:
      // 'svelte/rule-name': 'error'
    }
  }
);
```

> [!WARNING]
> The TypeScript parser uses a singleton internally, meaning it only respects the options provided during its initial initialization.
> If you try to change the options for a different file or override them later, the parser will ignore the new options, which may lead to errors.
> For more context, see [typescript-eslint/typescript-eslint#6778](https://github.com/typescript-eslint/typescript-eslint/issues/6778).

### Available Configurations

This plugin provides the following configurations:

- **`eslintPluginSvelte.configs.base`** ... Enables correct Svelte parsing.
- **`eslintPluginSvelte.configs.recommended`** ... Includes `base` configuration, plus rules to prevent errors or unintended behavior.
- **`eslintPluginSvelte.configs.prettier`** ... Disables rules that may conflict with [Prettier](https://prettier.io/). You still need to configure Prettier to work with Svelte manually, for example, by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).
- **`eslintPluginSvelte.configs.all`** ... Includes all available rules. **Note:** This configuration is not recommended for production use, as it changes with every minor and major version of `eslint-plugin-svelte`. Use at your own risk.

For more details, see [the rule list](https://sveltejs.github.io/eslint-plugin-svelte/rules/) to explore the rules provided by this plugin.

### settings.svelte

You can customize the behavior of this plugin using specific settings.

```js
// eslint.config.js
export default [
  // ...
  {
    settings: {
      svelte: {
        // Specifies an array of rules to ignore reports within the template.
        // For example, use this to disable rules in the template that may produce unavoidable false positives.
        ignoreWarnings: [
          '@typescript-eslint/no-unsafe-assignment',
          '@typescript-eslint/no-unsafe-member-access'
        ],
        // Specifies options for Svelte compilation.
        // This affects rules that rely on Svelte compilation,
        // such as svelte/valid-compile and svelte/no-unused-svelte-ignore.
        // Note that this setting does not impact ESLint’s custom parser.
        compileOptions: {
          // Specifies options related to PostCSS. You can disable the PostCSS processing by setting it to false.
          postcss: {
            // Specifies the path to the directory that contains the PostCSS configuration.
            configFilePath: './path/to/my/postcss.config.js'
          }
        },
        // Even if settings.svelte.kit is not specified, the rules will attempt to load information from svelte.config.js.
        // However, if the default behavior does not work as expected, you should specify settings.svelte.kit explicitly.
        // If you are using SvelteKit with a non-default configuration, you need to set the following options.
        // The schema is a subset of SvelteKit’s configuration, so refer to the SvelteKit documentation for more details.
        // https://svelte.dev/docs/kit/configuration
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

## Editor Integrations

**Visual Studio Code**  
Install [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).  
Configure `.svelte` files in `.vscode/settings.json`:

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "svelte"]
}
```

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## Migration Guide

If you’re migrating from `eslint-plugin-svelte` v1 or [`@ota-meshi/eslint-plugin-svelte`](https://www.npmjs.com/package/@ota-meshi/eslint-plugin-svelte), see the [migration guide](https://sveltejs.github.io/eslint-plugin-svelte/migration/).

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/). Unlike [ESLint’s versioning policy](https://github.com/eslint/eslint#semantic-versioning-policy), new rules may be added in minor releases. If these new rules cause unwanted warnings, you can disable them.

<!--DOCS_IGNORE_END-->

## Rules

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
| [svelte/infinite-reactive-loop](https://sveltejs.github.io/eslint-plugin-svelte/rules/infinite-reactive-loop/) | Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent. | :star: |
| [svelte/no-dom-manipulating](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dom-manipulating/) | disallow DOM manipulating | :star: |
| [svelte/no-dupe-else-if-blocks](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-else-if-blocks/) | disallow duplicate conditions in `{#if}` / `{:else if}` chains | :star: |
| [svelte/no-dupe-on-directives](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-on-directives/) | disallow duplicate `on:` directives | :star: |
| [svelte/no-dupe-style-properties](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-style-properties/) | disallow duplicate style properties | :star: |
| [svelte/no-dupe-use-directives](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-use-directives/) | disallow duplicate `use:` directives | :star: |
| [svelte/no-not-function-handler](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-not-function-handler/) | disallow use of not function in event handler | :star: |
| [svelte/no-object-in-text-mustaches](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-object-in-text-mustaches/) | disallow objects in text mustache interpolation | :star: |
| [svelte/no-raw-special-elements](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-raw-special-elements/) | Checks for invalid raw HTML elements | :star::wrench: |
| [svelte/no-reactive-reassign](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-reassign/) | disallow reassigning reactive values | :star: |
| [svelte/no-shorthand-style-property-overrides](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-shorthand-style-property-overrides/) | disallow shorthand style properties that override related longhand properties | :star: |
| [svelte/no-store-async](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-store-async/) | disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features | :star: |
| [svelte/no-unknown-style-directive-property](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unknown-style-directive-property/) | disallow unknown `style:property` | :star: |
| [svelte/require-store-callbacks-use-set-param](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-callbacks-use-set-param/) | store callbacks must use `set` param |  |
| [svelte/require-store-reactive-access](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-reactive-access/) | disallow to use of the store itself as an operand. Need to use $ prefix or get function. | :star::wrench: |
| [svelte/valid-compile](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile/) | disallow warnings when compiling. |  |

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
| [svelte/no-immutable-reactive-statements](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-immutable-reactive-statements/) | disallow reactive statements that don't reference reactive values. | :star: |
| [svelte/no-inline-styles](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inline-styles/) | disallow attributes and directives that produce inline styles |  |
| [svelte/no-inspect](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inspect/) | Warns against the use of `$inspect` directive | :star: |
| [svelte/no-reactive-functions](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-functions/) | it's not necessary to define functions in reactive statements | :star::bulb: |
| [svelte/no-reactive-literals](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-literals/) | don't assign literal values in reactive statements | :star::bulb: |
| [svelte/no-svelte-internal](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-svelte-internal/) | svelte/internal will be removed in Svelte 6. | :star: |
| [svelte/no-unused-class-name](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-class-name/) | disallow the use of a class in the template without a corresponding style |  |
| [svelte/no-unused-svelte-ignore](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-svelte-ignore/) | disallow unused svelte-ignore comments | :star: |
| [svelte/no-useless-children-snippet](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-children-snippet/) | disallow explicit children snippet where it's not needed | :star: |
| [svelte/no-useless-mustaches](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/) | disallow unnecessary mustache interpolations | :star::wrench: |
| [svelte/prefer-const](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-const/) | Require `const` declarations for variables that are never reassigned after declared | :wrench: |
| [svelte/prefer-destructured-store-props](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-destructured-store-props/) | destructure values from object stores for better change tracking & fewer redraws | :bulb: |
| [svelte/require-each-key](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-each-key/) | require keyed `{#each}` block | :star: |
| [svelte/require-event-dispatcher-types](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-dispatcher-types/) | require type parameters for `createEventDispatcher` | :star: |
| [svelte/require-optimized-style-attribute](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-optimized-style-attribute/) | require style attributes that can be optimized |  |
| [svelte/require-stores-init](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-stores-init/) | require initial value in store | :star: |
| [svelte/valid-each-key](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-each-key/) | enforce keys to use variables defined in the `{#each}` block | :star: |

## Stylistic Issues

These rules relate to style guidelines, and are therefore quite subjective:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [svelte/consistent-selector-style](https://sveltejs.github.io/eslint-plugin-svelte/rules/consistent-selector-style/) | enforce a consistent style for CSS selectors |  |
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
| [svelte/no-export-load-in-svelte-module-in-kit-pages](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-export-load-in-svelte-module-in-kit-pages/) | disallow exporting load functions in `*.svelte` module in SvelteKit page components. | :star: |
| [svelte/no-navigation-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-base/) | disallow using navigation (links, goto, pushState, replaceState) without the base path |  |
| [svelte/valid-prop-names-in-kit-pages](https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-prop-names-in-kit-pages/) | disallow props other than data or errors in SvelteKit page components. | :star: |

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
| [svelte/no-dynamic-slot-name](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dynamic-slot-name/) | Now Svelte compiler itself throws an compile error. |
| [svelte/no-goto-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-goto-without-base/) | [svelte/no-navigation-without-base](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-base/) |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->
<!-- prettier-ignore-end -->

<!--DOCS_IGNORE_START-->

## Contributing

Contributions are welcome! Please open an issue or submit a PR. For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).  
Refer to [svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser) for AST details.

<!--DOCS_IGNORE_END-->

## License

See [LICENSE](LICENSE) (MIT).
