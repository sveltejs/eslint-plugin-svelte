// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import type { Linter } from 'eslint';
import base from './base.js';
const config: Linter.Config[] = [
	...base,
	{
		name: 'svelte:recommended_svelte5_without_legacy:rules',
		rules: {
			// eslint-plugin-svelte rules
			'svelte/comment-directive': 'error',
			'svelte/derived-has-same-inputs-outputs': 'error',
			'svelte/no-at-debug-tags': 'warn',
			'svelte/no-at-html-tags': 'error',
			'svelte/no-deprecated-raw-special-elements': 'error',
			'svelte/no-dom-manipulating': 'error',
			'svelte/no-dupe-else-if-blocks': 'error',
			'svelte/no-dupe-style-properties': 'error',
			'svelte/no-dupe-use-directives': 'error',
			'svelte/no-ignored-unsubscribe': 'error',
			'svelte/no-inner-declarations': 'error',
			'svelte/no-inspect': 'warn',
			'svelte/no-object-in-text-mustaches': 'error',
			'svelte/no-shorthand-style-property-overrides': 'error',
			'svelte/no-store-async': 'error',
			'svelte/no-svelte-internal': 'error',
			'svelte/no-unknown-style-directive-property': 'error',
			'svelte/no-unused-class-name': 'error',
			'svelte/no-unused-svelte-ignore': 'error',
			'svelte/no-useless-mustaches': 'error',
			'svelte/prefer-class-directive': 'error',
			'svelte/prefer-destructured-store-props': 'error',
			'svelte/prefer-style-directive': 'error',
			'svelte/require-each-key': 'error',
			'svelte/require-store-reactive-access': 'error',
			'svelte/system': 'error',
			'svelte/valid-compile': 'error',
			'svelte/valid-each-key': 'error'
		}
	}
];
export default config;
