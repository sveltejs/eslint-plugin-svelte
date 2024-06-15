// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import path from 'path';
const base = require.resolve('./base');
const baseExtend = path.extname(`${base}`) === '.ts' ? 'plugin:svelte/base' : base;
export = {
	extends: [baseExtend],
	rules: {
		// eslint-plugin-svelte rules
		'svelte/comment-directive': 'error' as const,
		'svelte/no-at-debug-tags': 'warn' as const,
		'svelte/no-at-html-tags': 'error' as const,
		'svelte/no-dupe-else-if-blocks': 'error' as const,
		'svelte/no-dupe-style-properties': 'error' as const,
		'svelte/no-dynamic-slot-name': 'error' as const,
		'svelte/no-inner-declarations': 'error' as const,
		'svelte/no-not-function-handler': 'error' as const,
		'svelte/no-object-in-text-mustaches': 'error' as const,
		'svelte/no-shorthand-style-property-overrides': 'error' as const,
		'svelte/no-unknown-style-directive-property': 'error' as const,
		'svelte/no-unused-svelte-ignore': 'error' as const,
		'svelte/system': 'error' as const,
		'svelte/valid-compile': 'error' as const
	}
};
