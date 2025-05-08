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

## From `eslint-plugin-svelte` v2 To v3

This section explains the necessary changes when upgrading from `eslint-plugin-svelte` v2 to v3.\
v3 includes **support for ESLint Flat Config only**, **changes to the recommended rule set**, and other breaking changes.

---

## Breaking Changes

### 1. **Minimum Node.js Version Requirement**

v3 requires **one of the following Node.js versions**:

- `^18.20.4`
- `^20.18.0`
- `>=22.10.0`

### 2. **ESLint Flat Config Only**

- `.eslintrc.js` and `.eslintrc.json` are **no longer supported**.
- You must use **Flat Config (`eslint.config.js`)**.
- See [README](README.md) for more details.

### 3. **ESLint Version Requirement**

- v3 requires **ESLint 8.57.1 or later** (including v9.x).

### 4. **Changes to Recommended Rule Set**

- The following rules are now included in `recommended`:
  - `svelte/infinite-reactive-loop`
  - `svelte/no-dom-manipulating`
  - `svelte/no-dupe-on-directives`
  - `svelte/no-reactive-reassign`
  - `svelte/require-event-dispatcher-types`
  - Many others (See [Changelog](https://github.com/sveltejs/eslint-plugin-svelte/releases/tag/eslint-plugin-svelte%403.0.0-next.16) for more details)
- `svelte/valid-compile` has been **removed** from `recommended`.

### 5. **Deprecated Rules**

- `svelte/no-dynamic-slot-name` is **deprecated**.
- `svelte/no-goto-without-base` is **deprecated** and replaced with `svelte/no-navigation-without-base`.

---

## New Features & Improvements

### 1. **Support for Svelte 5**

- Rules such as `no-not-function-handler` and `valid-prop-names-in-kit-pages` now support **Svelte 5**.

### 2. **New Rules**

- `consistent-selector-style`: Enforce consistent selector styles.
- `no-useless-children-snippet`: Prevent unnecessary `{@children}` usage.
- `prefer-const`: Prefer `const` over `let`.
- `no-navigation-without-base`: Ensure proper usage of `goto()`.

---

## Migration Steps

### 1. **Upgrade Package**

```sh
npm install eslint-plugin-svelte@3
```

### 2. **Check Node.js Version**

```sh
node -v
```

- Ensure it is `v18.20.4` or later.

### 3. **Check ESLint Version**

```sh
npx eslint -v
```

- Ensure it is `8.57.1` or later (or `9.x`).

### 4. **Use Flat Config (`eslint.config.js`)**

- Remove `.eslintrc.js` and migrate to `eslint.config.js`.

### 5. **Apply the Updated Recommended Rules**

- If using `recommended`, check the impact of newly added rules.

### 6. **Replace Deprecated Rules**

- Replace `no-goto-without-base` with `no-navigation-without-base`.
