import { rules as pluginRules } from '../../../../../packages/eslint-plugin-svelte/src/utils/rules.ts';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import * as svelteEslintParser from 'svelte-eslint-parser';

export {
	preprocess,
	postprocess
} from '../../../../../packages/eslint-plugin-svelte/src/processor/index.ts';

export const categories = [
	{
		title: 'Possible Errors',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'Security Vulnerability',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'Best Practices',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'Stylistic Issues',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'Extension Rules',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'SvelteKit',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'Experimental',
		classes: 'svelte-category',
		rules: []
	},
	{
		title: 'System',
		classes: 'svelte-category',
		rules: []
	},
	{
		type: 'problem',
		title: 'Possible Errors (CORE)',
		classes: 'core-category',
		rules: []
	},
	{
		type: 'suggestion',
		title: 'Suggestions (CORE)',
		classes: 'core-category',
		rules: []
	},
	{
		type: 'layout',
		title: 'Layout & Formatting (CORE)',
		classes: 'core-category',
		rules: []
	}
];
export const DEFAULT_RULES_CONFIG = {};

const rules = [];
for (const rule of pluginRules) {
	if (rule.meta.deprecated) {
		continue;
	}
	const data = {
		ruleId: rule.meta.docs.ruleId,
		rule,
		classes: 'svelte-rule',
		url: rule.meta.docs.url
	};
	rules.push(data);
	const category = rule.meta.docs.category;
	categories.find((c) => c.title === category).rules.push(data);

	if (
		rule.meta.docs.ruleId !== 'svelte/no-export-load-in-svelte-module-in-kit-pages' &&
		rule.meta.docs.ruleId !== 'svelte/valid-prop-names-in-kit-pages' &&
		rule.meta.docs.ruleId !== 'svelte/no-restricted-html-elements'
	) {
		DEFAULT_RULES_CONFIG[rule.meta.docs.ruleId] = 'error';
	}
}

for (const [ruleId, rule] of builtinRules) {
	if (rule.meta.deprecated) {
		continue;
	}
	const data = {
		ruleId,
		rule,
		classes: 'core-rule',
		url: rule.meta.docs.url
	};
	rules.push(data);
	const type = rule.meta.type;
	categories.find((c) => c.type === type).rules.push(data);

	if (rule.meta.docs.recommended && ruleId !== 'no-inner-declarations') {
		DEFAULT_RULES_CONFIG[ruleId] = 'error';
	}
}

/** Get rule data */
export function getRule(ruleId) {
	for (const cat of categories) {
		for (const rule of cat.rules) {
			if (rule.ruleId === ruleId) {
				return rule;
			}
		}
	}
	return '';
}

/**
 * @returns {import('eslint').Linter.Config[]}
 */
export function createLinterConfig() {
	return [
		{
			files: ['**'],
			plugins: {
				svelte: {
					rules: Object.fromEntries(pluginRules.map((rule) => [rule.meta.docs.ruleName, rule]))
				}
			}
		},
		{
			files: ['**/*.svelte', '*.svelte'],
			languageOptions: {
				parser: svelteEslintParser
			}
		}
	];
}

export function rulesMap() {
	return new Map([...builtinRules, ...pluginRules.map((rule) => [rule.meta.docs.ruleId, rule])]);
}
