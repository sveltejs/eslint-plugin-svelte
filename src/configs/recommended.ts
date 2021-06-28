import path from "path"
const base = require.resolve("./base")
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:@ota-meshi/svelte/base" : base
export = {
  extends: [baseExtend],
  rules: {
    // @ota-meshi/eslint-plugin-svelte rules
    "@ota-meshi/svelte/comment-directive": "error",
    "@ota-meshi/svelte/no-at-debug-tags": "warn",
    "@ota-meshi/svelte/no-at-html-tags": "error",
    "@ota-meshi/svelte/no-dupe-else-if-blocks": "error",
    "@ota-meshi/svelte/no-inner-declarations": "error",
    "@ota-meshi/svelte/no-object-in-text-mustaches": "error",
    "@ota-meshi/svelte/system": "error",
  },
}
