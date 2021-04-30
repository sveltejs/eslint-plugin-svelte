import path from "path"
const base = require.resolve("./base")
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:@ota-meshi/svelte/base" : base
export = {
  extends: [baseExtend],
  rules: {
    // @ota-meshi/eslint-plugin-svelte rules
    "@ota-meshi/svelte/no-at-html-tags": "error",
  },
}
