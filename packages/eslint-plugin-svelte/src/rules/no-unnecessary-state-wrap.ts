import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import type { TSESTree } from '@typescript-eslint/types';

const REACTIVE_CLASSES = [
	'SvelteSet',
	'SvelteMap',
	'SvelteURL',
	'SvelteURLSearchParams',
	'SvelteDate',
	'MediaQuery'
];

export default createRule('no-unnecessary-state-wrap', {
	meta: {
		docs: {
			description: 'Disallow unnecessary $state wrapping of reactive classes',
			category: 'Best Practices',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					additionalReactiveClasses: {
						type: 'array',
						items: {
							type: 'string'
						},
						uniqueItems: true
					},
					allowReassign: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			unnecessaryStateWrap: '{{className}} is already reactive, $state wrapping is unnecessary.',
			suggestRemoveStateWrap: 'Remove unnecessary $state wrapping'
		},
		type: 'suggestion',
		hasSuggestions: true,
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		]
	},
	create(context) {
		const options = context.options[0] ?? {};
		const additionalReactiveClasses = options.additionalReactiveClasses ?? [];
		const allowReassign = options.allowReassign ?? false;

		const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
		const traceMap: Record<string, Record<string, boolean>> = {};
		for (const reactiveClass of REACTIVE_CLASSES) {
			traceMap[reactiveClass] = {
				[ReferenceTracker.CALL]: true,
				[ReferenceTracker.CONSTRUCT]: true
			};
		}

		// Track all reactive class imports and their aliases
		const references = referenceTracker.iterateEsmReferences({
			'svelte/reactivity': {
				[ReferenceTracker.ESM]: true,
				...traceMap
			}
		});

		const referenceNodeAndNames = Array.from(references).map(({ node, path }) => {
			return {
				node,
				name: path[path.length - 1]
			};
		});

		function isReassigned(identifier: TSESTree.Identifier): boolean {
			const variable = context.sourceCode.scopeManager.getDeclaredVariables(identifier.parent)[0];
			return variable.references.some((ref) => {
				return ref.isWrite() && ref.identifier !== identifier;
			});
		}

		function reportUnnecessaryStateWrap(
			stateNode: TSESTree.Node,
			targetNode: TSESTree.Node,
			className: string,
			identifier?: TSESTree.Identifier
		) {
			if (allowReassign && identifier && isReassigned(identifier)) {
				return;
			}

			context.report({
				node: targetNode,
				messageId: 'unnecessaryStateWrap',
				data: {
					className
				},
				suggest: [
					{
						messageId: 'suggestRemoveStateWrap',
						fix(fixer) {
							return fixer.replaceText(stateNode, context.sourceCode.getText(targetNode));
						}
					}
				]
			});
		}

		return {
			CallExpression(node: TSESTree.CallExpression) {
				if (node.callee.type !== 'Identifier' || node.callee.name !== '$state') {
					return;
				}

				for (const arg of node.arguments) {
					if (
						(arg.type === 'NewExpression' || arg.type === 'CallExpression') &&
						arg.callee.type === 'Identifier'
					) {
						const name = arg.callee.name;
						if (additionalReactiveClasses.includes(name)) {
							const parent = node.parent;
							if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
								reportUnnecessaryStateWrap(node, arg, name, parent.id);
							}
						}
					}
				}
			},

			'Program:exit': () => {
				for (const { node, name } of referenceNodeAndNames) {
					if (
						node.parent?.type === 'CallExpression' &&
						node.parent.callee.type === 'Identifier' &&
						node.parent.callee.name === '$state'
					) {
						const parent = node.parent.parent;
						if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
							reportUnnecessaryStateWrap(node.parent, node, name, parent.id);
						}
					}
				}
			}
		};
	}
});
