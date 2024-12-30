import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import { getLangValue } from '../utils/ast-utils.js';
import type { TSESTree } from '@typescript-eslint/types';
import { getSourceCode } from '../utils/compat.js';

export default createRule('require-event-dispatcher-types', {
	meta: {
		docs: {
			description: 'require type parameters for `createEventDispatcher`',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			missingTypeParameter: `Type parameters missing for the \`createEventDispatcher\` function call.`
		},
		type: 'suggestion'
	},
	create(context) {
		let isTs = false;
		return {
			SvelteScriptElement(node) {
				const lang = getLangValue(node)?.toLowerCase();
				if (lang === 'ts' || lang === 'typescript') {
					isTs = true;
				}
			},
			'Program:exit'() {
				if (!isTs) {
					return;
				}
				const referenceTracker = new ReferenceTracker(
					getSourceCode(context).scopeManager.globalScope!
				);
				for (const { node: n } of referenceTracker.iterateEsmReferences({
					svelte: {
						[ReferenceTracker.ESM]: true,
						createEventDispatcher: {
							[ReferenceTracker.CALL]: true
						}
					}
				})) {
					const node = n as TSESTree.CallExpression;
					if (
						(node.typeArguments ??
							// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
							(node as any).typeParameters) === undefined
					) {
						context.report({ node, messageId: 'missingTypeParameter' });
					}
				}
			}
		};
	}
});
