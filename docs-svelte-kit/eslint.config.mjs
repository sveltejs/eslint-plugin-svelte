import * as myPlugin from '@ota-meshi/eslint-plugin';
import globals from 'globals';

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
	{
		ignores: [
			'node_modules/',
			'.svelte-kit/',
			'build/',
			'shim/eslint.mjs',
			'shim/assert.mjs',
			'src/routes/*.md',
			'src/routes/**/*.md',
			'src/app.html'
		]
	},
	...myPlugin.config({
		eslintPlugin: true,
		ts: true,
		json: true,
		packageJson: true,
		yaml: true,
		md: true,
		prettier: true,
		svelte: { withTs: false }
	}),
	{
		languageOptions: {
			sourceType: 'module',
			globals: {
				...globals.browser,
				require: 'readonly'
			}
		}
	},
	{
		rules: {
			'jsdoc/require-jsdoc': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'no-shadow': 'off',
			// SvelteKit's docs usually use const instead of function.
			'func-style': 'off',
			// SvelteKit sometimes needs to use @sveltejs/kit package's `error` instead of return.
			'consistent-return': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'new-cap': 'off',
			complexity: 'off',
			'n/no-missing-import': 'off',
			'n/file-extension-in-import': 'off',
			'n/no-extraneous-import': 'off',
			// We need to use {@html} for markdown rendering.
			'svelte/no-at-html-tags': 'off',
			// Delegate it to Svelte compiler's check.
			'svelte/valid-compile': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: { project: null }
		}
	}
];
export default config;
