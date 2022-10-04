module.exports = {
  extends: ["plugin:@ota-meshi/+svelte"],
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "svelte/no-target-blank": "error",
    "svelte/button-has-type": "error",
    "node/file-extension-in-import": "off",
  },
}
