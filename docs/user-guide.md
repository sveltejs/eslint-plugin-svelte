# User Guide

<!--USAGE_GUIDE_START-->

## Installation

### CLI

The recommended way to get started is to use the CLI.

```sh
# new project
npx sv create

# existing project
npx sv add eslint
```

See the [CLI docs](https://svelte.dev/docs/cli/eslint) for more details.

### Manual Setup

```sh
npm install --save-dev svelte eslint eslint-plugin-svelte globals
```

> [!NOTE]
>
> **Requirements:**
>
> - ESLint v8.57.1, v9.0.0, and above
> - Node.js v18.18.0, v20.9.0, v21.1.0 and above

## Usage

Use `eslint.config.js` to configure rules. See [ESLint documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new) for more details.

### JavaScript project

```js
// eslint.config.js
import svelteConfig from './svelte.config.js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';

export default defineConfig([
  // ...
  js.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // for Sveltekit in non-SPA mode
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        // explicitly importing allows for better compatibilty and functionality with rules and other tooling that depend on the config file.
        //
        // Note: `eslint --cache` will fail with non-serializable properties.
        // In those cases, please remove the non-serializable properties.
        // svelteConfig: {
        //   ...svelteConfig,
        //   kit: {
        //     ...svelteConfig.kit,
        //     typescript: undefined
        //   }
        // }
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
]);
```

### TypeScript project

```shell
npm install --save-dev typescript-eslint
```

```js
// eslint.config.js
import svelteConfig from './svelte.config.js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default defineConfig(
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // for Sveltekit in non-SPA mode
        ...globals.node
      }
    }
    // ...
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    // See more details at: https://typescript-eslint.io/packages/parser/
    languageOptions: {
      parserOptions: {
        projectService: true,
        // Enable typescript parsing for `.svelte` files.
        extraFileExtensions: ['.svelte'],

        // Specify a parser for each language, if needed:
        // parser: {
        //   ts: ts.parser,
        //   typescript: ts.parser
        //   js: espree,            // add `import espree from 'espree'`
        // },
        parser: ts.parser,

        // explicitly importing allows for better compatibilty and functionality with rules and other tooling that depend on the config file.
        //
        // Note: `eslint --cache` will fail with non-serializable properties.
        // In those cases, please remove the non-serializable properties.
        // svelteConfig: {
        //   ...svelteConfig,
        //   kit: {
        //     ...svelteConfig.kit,
        //     typescript: undefined
        //   }
        // }
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

- **`svelte.configs.base`** - Enables correct Svelte parsing. What does this include exactly?
- **`svelte.configs.recommended`** - Extends the `base` config with additional rules for Svelte best practices.
- **`svelte.configs.prettier`** - Disables rules that may conflict with [Prettier](https://prettier.io/). You still need to configure Prettier to work with Svelte, for example, by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).
- **`svelte.configs.all`** - **Not Recommended** - Includes all available rules. Subject to change with every major and minor release. Use at your own risk.

For more details, see [the rule list](./rules.md) to explore the rules provided by this plugin.

### settings.svelte

You can customize the behavior of this plugin using specific settings.

```js
// eslint.config.js
export default defineConfig([
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
        // such as `svelte/valid-compile` and `svelte/no-unused-svelte-ignore`.
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
]);
```

## Editor Integrations

**Visual Studio Code**\
Install [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).\
Configure `.svelte` files in `.vscode/settings.json`:

<!--USAGE_GUIDE_END-->

## FAQ

### You're using TypeScript and the imported `*.svelte` component types cannot be resolved or appear to be

You can try [typescript-eslint-parser-for-extra-files]. Note however that it is still an experimental package.\
If you know of a better solution than that please let us know.

[typescript-eslint-parser-for-extra-files]: https://github.com/ota-meshi/typescript-eslint-parser-for-extra-files
