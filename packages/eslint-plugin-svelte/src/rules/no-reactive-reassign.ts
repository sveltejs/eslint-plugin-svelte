import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getPropertyName } from '@eslint-community/eslint-utils';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-reactive-reassign', {
	meta: {
		docs: {
			description: 'disallow reassigning reactive values',
			category: 'Possible Errors',
			// TODO Switch to recommended in the major version.
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					props: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			assignmentToReactiveValue: "Assignment to reactive value '{{name}}'.",
			assignmentToReactiveValueProp: "Assignment to property of reactive value '{{name}}'."
		},
		type: 'problem'
	},
	create(context) {
		const props = context.options[0]?.props !== false; // default true
		const sourceCode = getSourceCode(context);
		const scopeManager = sourceCode.scopeManager;
		const globalScope = scopeManager.globalScope;
		const toplevelScope =
			globalScope?.childScopes.find((scope) => scope.type === 'module') || globalScope;
		if (!globalScope || !toplevelScope) {
			return {};
		}

		type CheckContext<P extends TSESTree.Node | AST.SvelteDirective> = {
			node: TSESTree.Expression;
			parent: P;
			pathNodes: TSESTree.MemberExpression[];
		};
		const CHECK_REASSIGN: {
			[key in TSESTree.Node['type'] | 'SvelteDirective']?: (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Ignore
				ctx: CheckContext<any>
			) =>
				| null // The given expression does not reassign.
				// The given expression will reassign.
				| {
						type: 'reassign';
						node: TSESTree.Node | AST.SvelteNode;
						pathNodes?: TSESTree.MemberExpression[];
				  }
				// The context to check next.
				| {
						type: 'check';
						node: TSESTree.Expression;
						pathNodes?: TSESTree.MemberExpression[];
				  };
		} = {
			UpdateExpression:
				// e.g. foo ++, foo --
				({ parent }) => ({ type: 'reassign', node: parent }),
			UnaryExpression: ({ parent }: CheckContext<TSESTree.UnaryExpression>) => {
				if (parent.operator === 'delete') {
					// e.g. delete foo.prop
					return { type: 'reassign', node: parent };
				}
				return null;
			},
			AssignmentExpression: ({ node, parent }: CheckContext<TSESTree.AssignmentExpression>) => {
				if (parent.left === node) {
					// e.g. foo = 42, foo += 42, foo -= 42
					return { type: 'reassign', node: parent };
				}
				return null;
			},
			ForInStatement: ({ node, parent }: CheckContext<TSESTree.ForInStatement>) => {
				if (parent.left === node) {
					// e.g. for (foo in itr)
					return { type: 'reassign', node: parent };
				}
				return null;
			},
			ForOfStatement: ({ node, parent }: CheckContext<TSESTree.ForOfStatement>) => {
				if (parent.left === node) {
					// e.g. for (foo of itr)
					return { type: 'reassign', node: parent };
				}
				return null;
			},
			CallExpression: ({ node, parent, pathNodes }: CheckContext<TSESTree.CallExpression>) => {
				if (pathNodes.length > 0 && parent.callee === node) {
					const mem = pathNodes[pathNodes.length - 1];
					const callName = getPropertyName(mem);
					if (
						callName &&
						/^(?:push|pop|shift|unshift|reverse|splice|sort|copyWithin|fill)$/u.test(callName)
					) {
						// e.g. foo.push()
						return {
							type: 'reassign',
							node: parent,
							pathNodes: pathNodes.slice(0, -1)
						};
					}
				}
				return null;
			},
			MemberExpression: ({ node, parent, pathNodes }: CheckContext<TSESTree.MemberExpression>) => {
				if (parent.object === node) {
					// The context to check next.
					return {
						type: 'check',
						node: parent,
						pathNodes: [...pathNodes, parent]
					};
				}
				return null;
			},
			ChainExpression: ({ parent }: CheckContext<TSESTree.ChainExpression>) => {
				// e.g. `foo?.prop`
				// The context to check next.
				return { type: 'check', node: parent };
			},
			ConditionalExpression: ({ node, parent }: CheckContext<TSESTree.ConditionalExpression>) => {
				if (parent.test === node) {
					return null;
				}
				// The context to check next for `(test ? foo : bar).prop`.
				return { type: 'check', node: parent };
			},
			Property: ({ node, parent }: CheckContext<TSESTree.Property>) => {
				if (parent.value === node && parent.parent && parent.parent.type === 'ObjectPattern') {
					// The context to check next for `({a: foo} = obj)`.
					return { type: 'check', node: parent.parent };
				}
				return null;
			},
			ArrayPattern: ({ node, parent }: CheckContext<TSESTree.ArrayPattern>) => {
				if (parent.elements.includes(node as TSESTree.DestructuringPattern)) {
					// The context to check next for `([foo] = obj)`.
					return { type: 'check', node: parent };
				}
				return null;
			},
			RestElement: ({ node, parent }: CheckContext<TSESTree.RestElement>) => {
				if (parent.argument === node && parent.parent) {
					// The context to check next for `({...foo} = obj)`.
					return {
						type: 'check',
						node: parent.parent as TSESTree.ArrayPattern | TSESTree.ObjectPattern
					};
				}
				return null;
			},
			SvelteDirective: ({ node, parent }: CheckContext<AST.SvelteDirective>) => {
				if (parent.kind !== 'Binding') {
					return null;
				}
				if (parent.shorthand || parent.expression === node) {
					return {
						type: 'reassign',
						node: parent
					};
				}
				return null;
			}
		};

		/**
		 * Returns the reassign information for the given expression node if it has a reassign.
		 */
		function getReassignData(expr: TSESTree.Expression) {
			let pathNodes: TSESTree.MemberExpression[] = [];
			let node: TSESTree.Expression = expr;
			let parent;
			while ((parent = node.parent)) {
				const check = CHECK_REASSIGN[parent.type];
				if (!check) {
					return null;
				}
				const result = check({ node, parent, pathNodes });
				if (!result) {
					return null;
				}
				pathNodes = result.pathNodes || pathNodes;
				if (result.type === 'reassign') {
					return {
						node: result.node,
						pathNodes
					};
				}
				node = result.node;
			}
			return null;
		}

		return {
			SvelteReactiveStatement(node: AST.SvelteReactiveStatement) {
				if (
					node.body.type !== 'ExpressionStatement' ||
					node.body.expression.type !== 'AssignmentExpression' ||
					node.body.expression.operator !== '='
				) {
					return;
				}
				const assignment = node.body.expression;
				for (const variable of toplevelScope.variables) {
					if (!variable.defs.some((def) => def.node === assignment)) {
						continue;
					}
					for (const reference of variable.references) {
						const id = reference.identifier;
						if (
							(assignment.left.range[0] <= id.range[0] &&
								id.range[1] <= assignment.left.range[1]) ||
							id.type === 'JSXIdentifier'
						) {
							continue;
						}
						const reassign = getReassignData(id);
						if (!reassign) {
							continue;
						}

						// Suppresses reporting if the props option is set to `false` and reassigned to properties.
						if (!props && reassign.pathNodes.length > 0) continue;

						context.report({
							node: reassign.node,
							messageId:
								reassign.pathNodes.length === 0
									? 'assignmentToReactiveValue'
									: 'assignmentToReactiveValueProp',
							data: {
								name: id.name
							}
						});
					}
				}
			}
		};
	}
});
