import { createRule } from '../utils/index.js';
import { all as allKnownCSSProperties } from 'known-css-properties';
import { toRegExp } from '../utils/regexp.js';
import { hasVendorPrefix } from '../utils/css-utils/index.js';

export default createRule('no-unknown-style-directive-property', {
	meta: {
		docs: {
			description: 'disallow unknown `style:property`',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreProperties: {
						type: 'array',
						items: {
							type: 'string'
						},
						uniqueItems: true,
						minItems: 1
					},
					ignorePrefixed: { type: 'boolean' }
				},
				additionalProperties: false
			}
		],
		messages: {
			unknown: "Unexpected unknown style directive property '{{property}}'."
		},
		type: 'problem'
	},
	create(context) {
		const ignoreProperties = [...(context.options[0]?.ignoreProperties ?? [])].map(toRegExp);
		const ignorePrefixed: boolean = context.options[0]?.ignorePrefixed ?? true;
		const knownProperties = new Set<string>(allKnownCSSProperties);

		/** Checks whether given name is valid */
		function validName(name: string) {
			return (
				name.startsWith('--') ||
				knownProperties.has(name) ||
				ignoreProperties.some((r) => r.test(name)) ||
				(ignorePrefixed && hasVendorPrefix(name))
			);
		}

		return {
			SvelteStyleDirective(node) {
				const prop = node.key.name;

				if (validName(prop.name)) {
					return;
				}
				context.report({
					node: prop,
					messageId: 'unknown',
					data: {
						property: prop.name
					}
				});
			}
		};
	}
});
