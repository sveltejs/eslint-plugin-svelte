# User Guide

> [!NOTE]
> This document is in development.\
> Please refer to the document for the version you are using.\
> For example, <https://github.com/sveltejs/eslint-plugin-svelte/blob/eslint-plugin-svelte%402.46.0/docs/user-guide.md>

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-svelte svelte
```

::: tip Requirements

- ESLint v8.57.1, v9.0.0 and above
- Node.js v18.20.4, v20.18.0, v22.10.0 and above

:::

## :book: Usage

<!--USAGE_GUIDE_START-->

Use the `eslint.config.js` file to configure rules. For more details, see the [ESLint documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new).

### JavaScript project

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

### TypeScript project

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

- **`eslintPluginSvelte.configs.base`**  
  Enables correct Svelte parsing.

- **`eslintPluginSvelte.configs.recommended`**  
  Includes `base` configuration, plus rules to prevent errors or unintended behavior.

- **`eslintPluginSvelte.configs.prettier`**  
  Disables rules that may conflict with [Prettier](https://prettier.io/).  
  You still need to configure Prettier to work with Svelte manually, for example, by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).

- **`eslintPluginSvelte.configs.all`**  
  Includes all available rules.  
  **Note:** This configuration is not recommended for production use, as it changes with every minor and major version of `eslint-plugin-svelte`. Use at your own risk.

For more details, see [the rule list](./rules.md) to explore the rules provided by this plugin.

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

## :question: FAQ

### You're using TypeScript and the imported `*.svelte` component types cannot be resolved or appear to be

You can try [typescript-eslint-parser-for-extra-files]. Note however that it is still an experimental package.\
If you know of a better solution than that please let us know.

[typescript-eslint-parser-for-extra-files]: https://github.com/ota-meshi/typescript-eslint-parser-for-extra-files
