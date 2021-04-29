# Introduction

`@ota-meshi/eslint-plugin-svelte` is ESLint plugin for Svelte using AST.  
You can check on the [Online DEMO](./playground/README.md).

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

## :book: Usage

See [User Guide](./user-guide/README.md).

## :white_check_mark: Rules

See [Available Rules](./rules/README.md).

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[svelte]: https://svelte.io/
