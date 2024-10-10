// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import type { Linter } from 'eslint';
import path from 'node:path';
const base = require.resolve('./base');
const baseExtend = path.extname(`${base}`) === '.ts' ? 'plugin:svelte/base' : base;
const config: Linter.LegacyConfig = {
	extends: [baseExtend],
	rules: {
		// eslint-plugin-svelte rules
		'svelte/first-attribute-linebreak': 'off',
		'svelte/html-closing-bracket-new-line': 'off',
		'svelte/html-closing-bracket-spacing': 'off',
		'svelte/html-quotes': 'off',
		'svelte/html-self-closing': 'off',
		'svelte/indent': 'off',
		'svelte/max-attributes-per-line': 'off',
		'svelte/mustache-spacing': 'off',
		'svelte/no-spaces-around-equal-signs-in-attribute': 'off',
		'svelte/no-trailing-spaces': 'off',
		'svelte/shorthand-attribute': 'off',
		'svelte/shorthand-directive': 'off'
	}
};
export = config;
