// eslint-disable-next-line no-undef -- ignore
module.exports = {
  extends: ["plugin:@ota-meshi/svelte/recommended"],
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "@ota-meshi/svelte/no-target-blank": "error",
    "@ota-meshi/svelte/button-has-type": "error",
    "@ota-meshi/svelte/no-useless-mustaches": "error",
    "@ota-meshi/svelte/prefer-class-directive": "error",
    // TODO Still get an error with prettier-plugin-svelte. Probably fixed in v2.6.
    // "@ota-meshi/svelte/prefer-style-directive": "error",
    "@ota-meshi/svelte/spaced-html-comment": "error",
  },
}
