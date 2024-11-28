import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import {
	findAttribute,
	findShorthandAttribute,
	findBindDirective,
	getStaticAttributeValue
} from '../utils/ast-utils.js';

type Options = {
	button: boolean;
	submit: boolean;
	reset: boolean;
};

export default createRule('button-has-type', {
	meta: {
		docs: {
			description: 'disallow usage of button without an explicit type attribute',
			category: 'Best Practices',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					button: {
						type: 'boolean'
					},
					submit: {
						type: 'boolean'
					},
					reset: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			missingTypeAttribute: 'Missing an explicit type attribute for button.',
			invalidTypeAttribute: '{{value}} is an invalid value for button type attribute.',
			forbiddenTypeAttribute: '{{value}} is a forbidden value for button type attribute.',
			emptyTypeAttribute: 'A value must be set for button type attribute.'
		},
		type: 'suggestion' // "problem",
	},
	create(context) {
		const configuration: Options = {
			button: true,
			submit: true,
			reset: true,
			...(context.options[0] ?? {})
		};

		/**
		 * Checks whether given text is known button type
		 */
		function isButtonType(type: string): type is 'button' | 'submit' | 'reset' {
			return type === 'button' || type === 'submit' || type === 'reset';
		}

		/**
		 * Report
		 */
		function report(
			node: AST.SvelteAttribute | AST.SvelteBindingDirective | AST.SvelteStartTag,
			messageId: string,
			data: Record<string, string> = {}
		) {
			context.report({
				node,
				messageId,
				data
			});
		}

		/**
		 * Validate attribute
		 */
		function validateAttribute(attribute: AST.SvelteAttribute) {
			if (attribute.value.length === 0) {
				report(attribute, 'emptyTypeAttribute');
				return;
			}

			const strValue = getStaticAttributeValue(attribute);
			if (strValue == null) {
				return;
			}
			if (!isButtonType(strValue)) {
				report(attribute, 'invalidTypeAttribute', { value: strValue });
			} else if (!configuration[strValue]) {
				report(attribute, 'forbiddenTypeAttribute', { value: strValue });
			}
		}

		/**
		 * @param {VDirective} directive
		 */
		function validateDirective(directive: AST.SvelteBindingDirective) {
			if (!directive.expression) {
				report(directive, 'emptyTypeAttribute');
			}
		}

		return {
			"SvelteElement[name.name='button'] > SvelteStartTag"(node: AST.SvelteStartTag) {
				const typeAttr = findAttribute(node, 'type');
				if (typeAttr) {
					validateAttribute(typeAttr);
					return;
				}
				const typeDir = findBindDirective(node, 'type');
				if (typeDir) {
					validateDirective(typeDir);
					return;
				}
				const typeShortAttr = findShorthandAttribute(node, 'type');
				if (typeShortAttr) {
					return;
				}

				for (const attr of node.attributes) {
					if (attr.type === 'SvelteSpreadAttribute') {
						return;
					}
				}

				report(node, 'missingTypeAttribute');
			}
		};
	}
});
