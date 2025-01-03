import type { RuleModule, PartialRuleModule, PartialRuleMetaData, RuleContext } from '../types.js';
import { getSvelteContext, type SvelteContext } from '../utils/svelte-context.js';
import semver from 'semver';

function satisfiesCondition(
	condition: NonNullable<PartialRuleMetaData['conditions']>[number],
	svelteContext: SvelteContext
): boolean {
	if (
		condition.svelteVersion != null &&
		!semver.satisfies(svelteContext.svelteVersion, condition.svelteVersion)
	) {
		return false;
	}

	if (
		condition.fileTypes != null &&
		condition.fileTypes.length > 0 &&
		!condition.fileTypes.includes(svelteContext.fileType)
	) {
		return false;
	}

	if (condition.runes != null && condition.runes !== svelteContext.runes) {
		return false;
	}

	if (condition.svelteKitVersion != null) {
		if (
			svelteContext.svelteKitVersion == null ||
			!semver.satisfies(svelteContext.svelteKitVersion, condition.svelteKitVersion)
		) {
			return false;
		}
	}

	if (condition.svelteKitFileTypes != null && condition.svelteKitFileTypes.length > 0) {
		if (
			svelteContext.svelteKitFileType == null ||
			!condition.svelteKitFileTypes.includes(svelteContext.svelteKitFileType)
		) {
			return false;
		}
	}

	return true;
}

function shouldRun(
	svelteContext: SvelteContext | null,
	conditions: PartialRuleMetaData['conditions']
): boolean {
	// If svelteContext is null, it means the rule might be executed based on the analysis result of a different parser.
	// In this case, always execute the rule.
	if (svelteContext == null || conditions == null) {
		return true;
	}

	for (const condition of conditions) {
		if (satisfiesCondition(condition, svelteContext)) {
			return true;
		}
	}

	return false;
}

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
		create(context: RuleContext) {
			const { conditions } = rule.meta;
			const svelteContext = getSvelteContext(context);
			if (!shouldRun(svelteContext, conditions)) {
				return {};
			}

			return rule.create(context);
		}
	};
}
