import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { findVariable } from '../utils/ast-utils.js';
import type { AST } from 'svelte-eslint-parser';

export default createRule('no-navigation-without-resolve', {
	meta: {
		docs: {
			description:
				'disallow using navigation (links, goto, pushState, replaceState) without a resolve()',
			category: 'SvelteKit',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreGoto: {
						type: 'boolean'
					},
					ignoreLinks: {
						type: 'boolean'
					},
					ignorePushState: {
						type: 'boolean'
					},
					ignoreReplaceState: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			gotoWithoutResolve: "Found a goto() call with a url that isn't resolved.",
			linkWithoutResolve: "Found a link with a url that isn't resolved.",
			pushStateWithoutResolve: "Found a pushState() call with a url that isn't resolved.",
			replaceStateWithoutResolve: "Found a replaceState() call with a url that isn't resolved."
		},
		type: 'suggestion',
		conditions: [
			{
				svelteKitVersions: ['1.0.0-next', '1', '2']
			}
		]
	},
	create(context) {
		// Extract all imports of the resolve() function
		function extractResolveReferences(
			referenceTracker: ReferenceTracker
		): Set<TSESTree.Identifier> {
			const set = new Set<TSESTree.Identifier>();
			for (const { node } of referenceTracker.iterateEsmReferences({
				'$app/paths': {
					[ReferenceTracker.ESM]: true,
					resolve: {
						[ReferenceTracker.READ]: true
					}
				}
			})) {
				if (node.type === 'ImportSpecifier') {
					const variable = findVariable(context, node.local);
					if (variable === null) {
						continue;
					}
					for (const reference of variable.references) {
						if (reference.identifier.type === 'Identifier') set.add(reference.identifier);
					}
				} else if (
					node.type === 'MemberExpression' &&
					node.property.type === 'Identifier' &&
					node.property.name === 'resolve'
				) {
					set.add(node.property);
				}
			}
			return set;
		}

		// Extract all references to goto, pushState and replaceState
		function extractFunctionCallReferences(referenceTracker: ReferenceTracker) {
			const gotoCalls: TSESTree.CallExpression[] = [];
			const pushStateCalls: TSESTree.CallExpression[] = [];
			const replaceStateCalls: TSESTree.CallExpression[] = [];
			for (const { node, path } of referenceTracker.iterateEsmReferences({
				'$app/navigation': {
					[ReferenceTracker.ESM]: true,
					goto: {
						[ReferenceTracker.CALL]: true
					},
					pushState: {
						[ReferenceTracker.CALL]: true
					},
					replaceState: {
						[ReferenceTracker.CALL]: true
					}
				}
			})) {
				if (node.type !== 'CallExpression') {
					continue;
				}
				const lastPart = path[path.length - 1];
				if (lastPart === 'goto') {
					gotoCalls.push(node);
				} else if (lastPart === 'pushState') {
					pushStateCalls.push(node);
				} else if (lastPart === 'replaceState') {
					replaceStateCalls.push(node);
				}
			}
			return {
				gotoCalls,
				pushStateCalls,
				replaceStateCalls
			};
		}

		// Actual function checking

		function checkGotoCall(
			call: TSESTree.CallExpression,
			resolveReferences: Set<TSESTree.Identifier>
		): void {
			if (call.arguments.length < 1) {
				return;
			}
			const url = call.arguments[0];
			if (!isResolveCall(url, resolveReferences)) {
				context.report({ loc: url.loc, messageId: 'gotoWithoutResolve' });
			}
		}

		function checkShallowNavigationCall(
			call: TSESTree.CallExpression,
			resolveReferences: Set<TSESTree.Identifier>,
			messageId: string
		): void {
			if (call.arguments.length < 1) {
				return;
			}
			const url = call.arguments[0];
			if (!isEmptyExpression(url) && !isResolveCall(url, resolveReferences)) {
				context.report({ loc: url.loc, messageId });
			}
		}

		// Helper functions

		function isResolveCall(
			node: TSESTree.CallExpressionArgument,
			resolveReferences: Set<TSESTree.Identifier>
		): boolean {
			if (
				node.type === 'CallExpression' &&
				((node.callee.type === 'Identifier' && resolveReferences.has(node.callee)) ||
					(node.callee.type === 'MemberExpression' &&
						node.callee.property.type === 'Identifier' &&
						resolveReferences.has(node.callee.property)))
			) {
				return true;
			}
			if (node.type !== 'Identifier') {
				return false;
			}
			const variable = findVariable(context, node);
			if (
				variable === null ||
				variable.identifiers.length === 0 ||
				variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
				variable.identifiers[0].parent.init === null ||
				variable.identifiers[0].parent.init === node
			) {
				return false;
			}
			return isResolveCall(variable.identifiers[0].parent.init, resolveReferences);
		}

		function isEmptyExpression(url: TSESTree.CallExpressionArgument): boolean {
			return (
				(url.type === 'Literal' && url.value === '') ||
				(url.type === 'TemplateLiteral' &&
					url.expressions.length === 0 &&
					url.quasis.length === 1 &&
					url.quasis[0].value.raw === '')
			);
		}

		function isAbsoluteExpression(url: AST.SvelteLiteral | TSESTree.Expression): boolean {
			switch (url.type) {
				case 'BinaryExpression':
					return isAbsoluteBinaryExpression(url);
				case 'Identifier':
					return isAbsoluteIdentifier(url);
				case 'Literal':
					return typeof url.value === 'string' && isAbsoluteUrl(url.value);
				case 'SvelteLiteral':
					return isAbsoluteUrl(url.value);
				case 'TemplateLiteral':
					return isAbsoluteTemplateLiteral(url);
				default:
					return false;
			}
		}

		function isAbsoluteBinaryExpression(url: TSESTree.BinaryExpression): boolean {
			return (
				(url.left.type !== 'PrivateIdentifier' && isAbsoluteExpression(url.left)) ||
				isAbsoluteExpression(url.right)
			);
		}

		function isAbsoluteIdentifier(url: TSESTree.Identifier): boolean {
			const variable = findVariable(context, url);
			if (
				variable === null ||
				variable.identifiers.length === 0 ||
				variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
				variable.identifiers[0].parent.init === null ||
				variable.identifiers[0].parent.init === url
			) {
				return false;
			}
			return isAbsoluteExpression(variable.identifiers[0].parent.init);
		}

		function isAbsoluteUrl(url: string): boolean {
			return /^[+a-z]*:/i.test(url);
		}

		function isAbsoluteTemplateLiteral(url: TSESTree.TemplateLiteral): boolean {
			return (
				url.expressions.some(isAbsoluteExpression) ||
				url.quasis.some((quasi) => isAbsoluteUrl(quasi.value.raw))
			);
		}

		function isFragmentExpression(url: AST.SvelteLiteral | TSESTree.Expression): boolean {
			switch (url.type) {
				case 'BinaryExpression':
					return isFragmentBinaryExpression(url);
				case 'Identifier':
					return isFragmentIdentifier(url);
				case 'Literal':
					return typeof url.value === 'string' && isFragmentUrl(url.value);
				case 'SvelteLiteral':
					return isFragmentUrl(url.value);
				case 'TemplateLiteral':
					return isFragmentTemplateLiteral(url);
				default:
					return false;
			}
		}

		function isFragmentBinaryExpression(url: TSESTree.BinaryExpression): boolean {
			return url.left.type !== 'PrivateIdentifier' && isFragmentExpression(url.left);
		}

		function isFragmentIdentifier(url: TSESTree.Identifier): boolean {
			const variable = findVariable(context, url);
			if (
				variable === null ||
				variable.identifiers.length === 0 ||
				variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
				variable.identifiers[0].parent.init === null ||
				variable.identifiers[0].parent.init === url
			) {
				return false;
			}
			return isFragmentExpression(variable.identifiers[0].parent.init);
		}

		function isFragmentUrl(url: string): boolean {
			return url.startsWith('#');
		}

		function isFragmentTemplateLiteral(url: TSESTree.TemplateLiteral): boolean {
			return (
				(url.expressions.length >= 1 && isFragmentExpression(url.expressions[0])) ||
				(url.quasis.length >= 1 && isFragmentUrl(url.quasis[0].value.raw))
			);
		}

		let resolveReferences: Set<TSESTree.Identifier> = new Set<TSESTree.Identifier>();
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				resolveReferences = extractResolveReferences(referenceTracker);
				const { gotoCalls, pushStateCalls, replaceStateCalls } =
					extractFunctionCallReferences(referenceTracker);
				if (context.options[0]?.ignoreGoto !== true) {
					for (const gotoCall of gotoCalls) {
						checkGotoCall(gotoCall, resolveReferences);
					}
				}
				if (context.options[0]?.ignorePushState !== true) {
					for (const pushStateCall of pushStateCalls) {
						checkShallowNavigationCall(pushStateCall, resolveReferences, 'pushStateWithoutResolve');
					}
				}
				if (context.options[0]?.ignoreReplaceState !== true) {
					for (const replaceStateCall of replaceStateCalls) {
						checkShallowNavigationCall(
							replaceStateCall,
							resolveReferences,
							'replaceStateWithoutResolve'
						);
					}
				}
			},
			SvelteAttribute(node) {
				if (
					context.options[0]?.ignoreLinks === true ||
					node.parent.parent.type !== 'SvelteElement' ||
					node.parent.parent.kind !== 'html' ||
					node.parent.parent.name.type !== 'SvelteName' ||
					node.parent.parent.name.name !== 'a' ||
					node.key.name !== 'href'
				) {
					return;
				}
				if (
					(node.value[0].type === 'SvelteLiteral' &&
						!isAbsoluteExpression(node.value[0]) &&
						!isFragmentExpression(node.value[0])) ||
					(node.value[0].type === 'SvelteMustacheTag' &&
						!isAbsoluteExpression(node.value[0].expression) &&
						!isFragmentExpression(node.value[0].expression) &&
						!isResolveCall(node.value[0].expression, resolveReferences))
				) {
					context.report({ loc: node.value[0].loc, messageId: 'linkWithoutResolve' });
				}
			}
		};
	}
});
