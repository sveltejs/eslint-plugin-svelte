'use strict'

module.exports = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: ['.*rc'],
      excludeFiles: ['.browserslistrc', '.npmrc', '.nvmrc'],
      options: {
        parser: 'json',
      },
    },
  ],
  plugins: ['prettier-plugin-svelte'],
}
