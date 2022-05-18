// eslint-disable-next-line no-undef -- ignore
module.exports = {
  extends: ["plugin:@ota-meshi/svelte/recommended"],
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "@ota-meshi/svelte/no-target-blank": "error",
    "@ota-meshi/svelte/button-has-type": "error",
    "@ota-meshi/svelte/no-useless-mustaches": "error",
    "@ota-meshi/svelte/prefer-class-directive": "error",
    "@ota-meshi/svelte/prefer-style-directive": "error",
    "@ota-meshi/svelte/spaced-html-comment": "error",
  },
}
