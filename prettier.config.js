'use strict';

module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	overrides: [
		{
			files: ['.*rc'],
			excludeFiles: ['.browserslistrc', '.npmrc', '.nvmrc'],
			options: {
				parser: 'json'
			}
		}
	],
	plugins: ['prettier-plugin-svelte']
};
