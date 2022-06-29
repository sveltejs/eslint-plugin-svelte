// eslint-disable-next-line no-undef -- ignore
module.exports = {
  extends: ["plugin:svelte/recommended"],
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
    "svelte/no-useless-mustaches": "error",
    "svelte/prefer-class-directive": "error",
    "svelte/prefer-style-directive": "error",
    "svelte/spaced-html-comment": "error",
  },
}
