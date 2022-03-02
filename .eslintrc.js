"use strict"

// const version = require("./package.json").version

module.exports = {
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2020,
    project: require.resolve("./tsconfig.json"),
  },
  extends: [
    "plugin:@ota-meshi/recommended",
    "plugin:@ota-meshi/+node",
    "plugin:@ota-meshi/+typescript",
    "plugin:@ota-meshi/+eslint-plugin",
    "plugin:@ota-meshi/+vue2",
    "plugin:@ota-meshi/+package-json",
    "plugin:@ota-meshi/+json",
    "plugin:@ota-meshi/+yaml",
    "plugin:@ota-meshi/+md",
    "plugin:@ota-meshi/+prettier",
  ],
  rules: {
    "require-jsdoc": "error",
    "no-warning-comments": "warn",
    "no-lonely-if": "off",
    "new-cap": "off",
    "no-shadow": "off",
    "prettier/prettier": [
      "error",
      {},
      {
        usePrettierrc: true,
      },
    ],
  },
  overrides: [
    {
      files: ["*.mjs"],
      parserOptions: {
        sourceType: "module",
      },
    },
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: {
          ts: "@typescript-eslint/parser",
          js: "espree",
        },
      },
    },
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        project: require.resolve("./tsconfig.json"),
      },
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "default",
            format: ["camelCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "typeLike",
            format: ["PascalCase"],
          },
          {
            selector: "property",
            format: null,
          },
          {
            selector: "method",
            format: null,
          },
        ],
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
    {
      files: ["src/rules/**"],
      rules: {},
    },
    {
      files: ["tests/**"],
      rules: {
        "@typescript-eslint/no-misused-promises": "off",
      },
    },
    {
      files: ["scripts/**/*.ts", "tests/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        project: require.resolve("./tsconfig.json"),
      },
      rules: {
        "require-jsdoc": "off",
        "no-console": "off",
      },
    },
    {
      files: ["*.vue"],
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        require: true,
      },
    },
    {
      files: ["docs/.vuepress/**"],
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        window: true,
      },
      rules: {
        "require-jsdoc": "off",
      },
    },
  ],
}
