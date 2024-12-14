// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import type { Linter } from 'eslint';
import base from './base.js';
const config: Linter.Config[] = [
	...base,
	{
		name: 'svelte:recommended-svelte3-4:rules',
		rules: {
			// eslint-plugin-svelte rules
			'svelte/comment-directive': 'error',
			'svelte/system': 'error'
		}
	}
];
export default config;
