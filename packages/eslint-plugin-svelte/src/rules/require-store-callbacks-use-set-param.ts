import { createRule } from '../utils/index.js';
import { extractStoreReferences } from './reference-helpers/svelte-store.js';

export default createRule('require-store-callbacks-use-set-param', {
	meta: {
		docs: {
			description: 'store callbacks must use `set` param',
			category: 'Possible Errors',
			recommended: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Store callbacks must use `set` param.'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			Program() {
				for (const { node } of extractStoreReferences(context, ['readable', 'writable'])) {
					const [_, fn] = node.arguments;
					if (!fn || (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression')) {
						continue;
					}
					const param = fn.params[0];
					if (!param || (param.type === 'Identifier' && param.name !== 'set')) {
						context.report({
							node: fn,
							loc: fn.loc,
							messageId: 'unexpected',
							fix: (fixer) => {
								if (param) {
									return fixer.replaceText(param, 'set');
								}
								const token = context.getSourceCode().getTokenBefore(fn.body, {
									filter: (token) => token.type === 'Punctuator' && token.value === '(',
									includeComments: false
								});
								if (token) {
									return fixer.insertTextAfter(token, 'set');
								}
								return [];
							}
						});
					}
				}
			}
		};
	}
});
