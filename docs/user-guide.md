# User Guide

## 💿 Installation

```bash
npm install --save-dev eslint eslint-plugin-svelte svelte
```

::: tip Requirements

- ESLint v7.0.0 and above
- Node.js v14.17.x, v16.x and above

:::

## 📖 Usage

<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import eslintPluginSvelte from 'eslint-plugin-svelte';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    rules: {
      // override/add rules settings here, such as:
      // 'svelte/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `eslintPluginSvelte.configs['flat/base']` ... Configuration to enable correct Svelte parsing.
- `eslintPluginSvelte.configs['flat/recommended']` ... Above, plus rules to prevent errors or unintended behavior.
- `eslintPluginSvelte.configs['flat/prettier']` ... Turns off rules that may conflict with [Prettier](https://prettier.io/) (You still need to configure prettier to work with svelte yourself, for example by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).).
- `eslintPluginSvelte.configs['flat/all']` ... All rules. This configuration is not recommended for production use because it changes with every minor and major version of `eslint-plugin-svelte`. Use it at your own risk.

See [the rule list](./rules.md) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Use `.eslintrc.*` file to configure rules. See also: <https://eslint.org/docs/user-guide/configuring>.

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rule sets here, such as:
    // 'eslint:recommended',
    'plugin:svelte/recommended'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'svelte/rule-name': 'error'
  }
};
```

This plugin provides configs:

- `plugin:svelte/base` ... Configuration to enable correct Svelte parsing.
- `plugin:svelte/recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `plugin:svelte/prettier` ... Turns off rules that may conflict with [Prettier](https://prettier.io/) (You still need to configure prettier to work with svelte yourself, for example by using [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).).
- `plugin:svelte/all` ... All rules. This configuration is not recommended for production use because it changes with every minor and major version of `eslint-plugin-svelte`. Use it at your own risk.

See [the rule list](./rules.md) to get the `rules` that this plugin provides.

::: warning ❗ Attention

The `eslint-plugin-svelte` can not be used with the [eslint-plugin-svelte3].
If you are using [eslint-plugin-svelte3] you need to remove it.

```diff
  "plugins": [
-   "svelte3"
  ]
```

:::

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.svelte`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: ['plugin:svelte/recommended'],
  // ...
  parser: '@babel/eslint-parser',
  // Add an `overrides` section to add a parser configuration for svelte.
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser'
    }
    // ...
  ]
  // ...
};
```

For example, if you are using the `"@typescript-eslint/parser"`, and if you want to use TypeScript in `<script>` of `.svelte`, you need to add more `parserOptions` configuration.

```js
module.exports = {
  // ...
  extends: ['plugin:svelte/recommended'],
  // ...
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // ...
    project: 'path/to/your/tsconfig.json',
    extraFileExtensions: ['.svelte'] // This is a required setting in `@typescript-eslint/parser` v4.24.0.
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
    // ...
  ]
  // ...
};
```

If you have a mix of TypeScript and JavaScript in your project, use a multiple parser configuration.

```js
module.exports = {
  // ...
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: {
          // Specify a parser for each lang.
          ts: '@typescript-eslint/parser',
          js: 'espree',
          typescript: '@typescript-eslint/parser'
        }
      }
    }
    // ...
  ]
  // ...
};
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
  ...eslintPluginSvelte.configs['flat/recommended'],
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
module.exports = {
  // ...
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
  // ...
};
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
module.exports = {
  // ...
  settings: {
    svelte: {
      kit: {
        files: {
          routes: 'src/routes'
        }
      }
    }
  }
  // ...
};
```

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.svelte` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.svelte src
eslint "src/**/*.{js,svelte}"
```

## 💻 Editor Integrations

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

## ❓ FAQ

### Parsing the `.svelte` file fails

You should check the [parser configuration](#parser-configuration).

### You're using TypeScript and the imported `*.svelte` component types cannot be resolved or appear to be

You can try [typescript-eslint-parser-for-extra-files]. Note however that it is still an experimental package.\
If you know of a better solution than that please let us know.

[eslint-plugin-svelte3]: https://github.com/sveltejs/eslint-plugin-svelte3
[typescript-eslint-parser-for-extra-files]: https://github.com/ota-meshi/typescript-eslint-parser-for-extra-files
