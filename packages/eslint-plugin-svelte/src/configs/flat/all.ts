import { rules } from '../../utils/rules';
import base from './base';
export default [
	...base,
	{
		name: 'svelte:all:rules',
		rules: Object.fromEntries(
			rules
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
