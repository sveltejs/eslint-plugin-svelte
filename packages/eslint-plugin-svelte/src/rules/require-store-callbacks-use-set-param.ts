import { getScope } from '../utils/ast-utils.js';
import type { RuleContext, SuggestionReportDescriptor } from '../types.js';
import { createRule } from '../utils/index.js';
import { extractStoreReferences } from './reference-helpers/svelte-store.js';
import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import { getSourceCode } from '../utils/compat.js';

function findVariableForName(
	context: RuleContext,
	node: TSESTree.Node,
	name: string | null,
	expectedName: string
): { hasConflict: boolean; variable: Variable | null } {
	const scope = getScope(context, node);
	let hasConflict = false;
	let variable: Variable | null = null;

	for (const v of scope.variables) {
		if (hasConflict && (variable || name === null)) {
			break;
		}
		if (v.name === expectedName) {
			hasConflict = true;
			continue;
		}
		if (name !== null && v.name === name) {
			variable = v;
		}
	}

	return { hasConflict, variable };
}

export default createRule('require-store-callbacks-use-set-param', {
	meta: {
		docs: {
			description: 'store callbacks must use `set` param',
			category: 'Possible Errors',
			recommended: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			unexpected: 'Store callbacks must use `set` param.',
			updateParam: 'Rename parameter from {{oldName}} to `set`.',
			addParam: 'Add a `set` parameter.'
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
						const { hasConflict, variable } = findVariableForName(
							context,
							fn.body,
							param ? param.name : null,
							'set'
						);
						const suggest: SuggestionReportDescriptor[] = [];
						if (!hasConflict) {
							if (param) {
								suggest.push({
									messageId: 'updateParam',
									data: { oldName: param.name },
									*fix(fixer) {
										yield fixer.replaceText(param, 'set');

										if (variable) {
											for (const ref of variable.references) {
												yield fixer.replaceText(ref.identifier, 'set');
											}
										}
									}
								});
							} else {
								const token = getSourceCode(context).getTokenBefore(fn.body, {
									filter: (token) => token.type === 'Punctuator' && token.value === '(',
									includeComments: false
								});
								if (token) {
									suggest.push({
										messageId: 'addParam',
										fix(fixer) {
											return fixer.insertTextAfter(token, 'set');
										}
									});
								}
							}
						}
						context.report({
							node: fn,
							loc: fn.loc,
							messageId: 'unexpected',
							suggest
						});
					}
				}
			}
		};
	}
});
