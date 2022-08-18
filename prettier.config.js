"use strict"

module.exports = {
  tabWidth: 2,
  semi: false,
  trailingComma: "all",
  overrides: [
    {
      files: [".*rc"],
      excludeFiles: [".browserslistrc", ".npmrc", ".nvmrc"],
      options: {
        parser: "json",
      },
    },
  ],
}
