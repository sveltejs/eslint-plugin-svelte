import { rules } from '../../utils/rules';
import base from './base';
export default [
	...base,
	{
		rules: Object.fromEntries(
			rules
				.map((rule) => [`svelte/${rule.meta.docs.ruleName}`, 'error' as const])
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
