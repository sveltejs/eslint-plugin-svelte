import path from "path"
const base = require.resolve("./base")
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:svelte/base" : base
export = {
  extends: [baseExtend],
  rules: {
    // eslint-plugin-svelte rules
    "svelte/first-attribute-linebreak": "off",
    "svelte/html-closing-bracket-spacing": "off",
    "svelte/html-quotes": "off",
    "svelte/indent": "off",
    "svelte/max-attributes-per-line": "off",
    "svelte/mustache-spacing": "off",
    "svelte/shorthand-attribute": "off",
    "svelte/shorthand-directive": "off",
  },
}
