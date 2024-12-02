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

See [the rule list](./rules.md) to get the `rules` that this plugin provides.

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

Specifies options for Svelte compile. Effects rules that use Svelte compile. The target rules are [svelte/valid-compile](./rules/valid-compile.md) and [svelte/no-unused-svelte-ignore](./rules/no-unused-svelte-ignore.md). **Note that it has no effect on ESLint's custom parser**.

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

## :question: FAQ

### Parsing the `.svelte` file fails

You should check the [parser configuration](#parser-configuration).

### You're using TypeScript and the imported `*.svelte` component types cannot be resolved or appear to be

You can try [typescript-eslint-parser-for-extra-files]. Note however that it is still an experimental package.\
If you know of a better solution than that please let us know.

[typescript-eslint-parser-for-extra-files]: https://github.com/ota-meshi/typescript-eslint-parser-for-extra-files
