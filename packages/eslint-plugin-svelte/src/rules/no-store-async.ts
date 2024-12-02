import { createRule } from '../utils/index.js';
import { extractStoreReferences } from './reference-helpers/svelte-store.js';

export default createRule('no-store-async', {
	meta: {
		docs: {
			description:
				'disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features',
			category: 'Possible Errors',
			// TODO Switch to recommended in the major version.
			// recommended: true,
			recommended: false,
			default: 'error'
		},
		schema: [],
		messages: {
			unexpected: 'Do not pass async functions to svelte stores.'
		},
		type: 'problem'
	},
	create(context) {
		return {
			Program() {
				for (const { node } of extractStoreReferences(context)) {
					const [, fn] = node.arguments;
					if (
						!fn ||
						(fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') ||
						!fn.async
					) {
						continue;
					}

					const start = fn.loc.start;
					context.report({
						node: fn,
						loc: {
							start,
							end: {
								line: start.line,
								column: start.column + 5
							}
						},
						messageId: 'unexpected'
					});
				}
			}
		};
	}
});
