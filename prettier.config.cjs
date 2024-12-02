'use strict';

module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: ['prettier-plugin-svelte'],
	overrides: [
		{
			files: ['.*rc'],
			excludeFiles: ['.browserslistrc', '.npmrc', '.nvmrc'],
			options: {
				parser: 'json'
			}
		},
		{
			files: ['*.svelte'],
			options: {
				bracketSameLine: false
			}
		},
		{
			files: ['*.md', 'package.json', '**/package.json'],
			options: {
				useTabs: false,
				tabWidth: 2
			}
		}
	]
};
