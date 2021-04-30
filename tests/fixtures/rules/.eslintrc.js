"use strict"

module.exports = {
  overrides: [
    {
      files: ["*output.svelte"],
      rules: {
        "prettier/prettier": "off",
      },
    },
  ],
}
