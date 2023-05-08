// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "yarn update"
import path from "path"
const base = require.resolve("./base")
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:svelte/base" : base
export = {
  extends: [baseExtend],
  rules: {
    // eslint-plugin-svelte rules
    "svelte/comment-directive": "error",
    "svelte/no-at-debug-tags": "warn",
    "svelte/no-at-html-tags": "error",
    "svelte/no-dupe-else-if-blocks": "error",
    "svelte/no-dupe-style-properties": "error",
    "svelte/no-dynamic-slot-name": "error",
    "svelte/no-inner-declarations": "error",
    "svelte/no-not-function-handler": "error",
    "svelte/no-object-in-text-mustaches": "error",
    "svelte/no-shorthand-style-property-overrides": "error",
    "svelte/no-unknown-style-directive-property": "error",
    "svelte/no-unused-svelte-ignore": "error",
    "svelte/system": "error",
    "svelte/valid-compile": "error",
  },
}
