import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import {
	findAttribute,
	findBindDirective,
	findShorthandAttribute,
	getStaticAttributeValue
} from '../utils/ast-utils.js';

/** Checks wether the given element node has external link */
function hasExternalLink(node: AST.SvelteStartTag) {
	return node.attributes.some(
		(attr) =>
			attr.type === 'SvelteAttribute' &&
			attr.key.name === 'href' &&
			attr.value.length >= 1 &&
			attr.value[0].type === 'SvelteLiteral' &&
			/^(?:\w+:|\/\/)/.test(attr.value[0].value)
	);
}

/** Checks wether the given element node has dynamic link */
function hasDynamicLink(node: AST.SvelteStartTag) {
	const attr = findAttribute(node, 'href');
	if (attr) {
		return attr.value.some((v) => v.type === 'SvelteMustacheTag');
	}
	return Boolean(findShorthandAttribute(node, 'href')) || Boolean(findBindDirective(node, 'href'));
}

/** Checks whether the given element node has target="_blank" */
function hasTargetBlank(node: AST.SvelteStartTag) {
	return node.attributes.some(
		(attr) =>
			attr.type === 'SvelteAttribute' &&
			attr.key.name === 'target' &&
			getStaticAttributeValue(attr) === '_blank'
	);
}

export default createRule('require-target-blank-external-link', {
	meta: {
		docs: {
			description: 'require `target="_blank"` attribute for external links',
			category: 'Security Vulnerability',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowReferrer: {
						type: 'boolean'
					},
					enforceDynamicLinks: {
						enum: ['always', 'never']
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			missing: 'External links must have target="_blank" attribute.'
		},
		type: 'problem'
	},
	create(context) {
		const configuration: {
			allowReferrer?: boolean;
			enforceDynamicLinks?: 'always' | 'never';
		} = context.options[0] || {};
		const enforceDynamicLinks: 'always' | 'never' = configuration.enforceDynamicLinks || 'always';

		return {
			SvelteElement(node) {
				if (node.name.type === 'SvelteName' && node.name.name !== 'a') return;

				const hasDangerHref =
					hasExternalLink(node.startTag) ||
					(enforceDynamicLinks === 'always' && hasDynamicLink(node.startTag));

				if (hasDangerHref && !hasTargetBlank(node.startTag)) {
					context.report({
						node,
						message: 'External links must have target="_blank" attribute.'
					});
				}
			}
		};
	}
});
