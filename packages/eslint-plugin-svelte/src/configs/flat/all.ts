// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import type { Linter } from 'eslint';
import { rules } from '../../utils/rules.js';
import base from './base.js';
const config: Linter.Config[] = [
	...base,
	{
		name: 'svelte:all:rules',
		rules: Object.fromEntries(
			rules
				.filter((rule) => !rule.meta.deprecated)
				.map((rule) => [`svelte/${rule.meta.docs.ruleName}`, 'error'])
				.filter(
					([ruleName]) =>
						![
							// Does not work without options.
							'svelte/no-restricted-html-elements'
						].includes(ruleName)
				)
		)
	}
];
export default config;
