import type { RuleModule, PartialRuleModule } from '../types.js';

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(ruleName: string, rule: PartialRuleModule): RuleModule {
	return {
		meta: {
			...rule.meta,
			docs: {
				...rule.meta.docs,
				url: `https://sveltejs.github.io/eslint-plugin-svelte/rules/${ruleName}/`,
				ruleId: `svelte/${ruleName}`,
				ruleName
			}
		},
		create: rule.create as never
	};
}
