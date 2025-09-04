import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { findVariable } from '../utils/ast-utils.js';
import type { RuleContext } from '../types.js';
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
		let resolveReferences: Set<TSESTree.Identifier> = new Set<TSESTree.Identifier>();
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				resolveReferences = extractResolveReferences(referenceTracker, context);
				const {
					goto: gotoCalls,
					pushState: pushStateCalls,
					replaceState: replaceStateCalls
				} = extractFunctionCallReferences(referenceTracker);
				if (context.options[0]?.ignoreGoto !== true) {
					for (const gotoCall of gotoCalls) {
						checkGotoCall(context, gotoCall, resolveReferences);
					}
				}
				if (context.options[0]?.ignorePushState !== true) {
					for (const pushStateCall of pushStateCalls) {
						checkShallowNavigationCall(
							context,
							pushStateCall,
							resolveReferences,
							'pushStateWithoutResolve'
						);
					}
				}
				if (context.options[0]?.ignoreReplaceState !== true) {
					for (const replaceStateCall of replaceStateCalls) {
						checkShallowNavigationCall(
							context,
							replaceStateCall,
							resolveReferences,
							'replaceStateWithoutResolve'
						);
					}
				}
			},
			SvelteShorthandAttribute(node) {
				if (
					context.options[0]?.ignoreLinks === true ||
					node.parent.parent.type !== 'SvelteElement' ||
					node.parent.parent.kind !== 'html' ||
					node.parent.parent.name.type !== 'SvelteName' ||
					node.parent.parent.name.name !== 'a' ||
					node.key.name !== 'href' ||
					node.value.type !== 'Identifier'
				) {
					return;
				}
				if (
					!expressionIsAbsolute(node.value, context) &&
					!expressionIsFragment(node.value, context) &&
					!isResolveCall(context, node.value, resolveReferences)
				) {
					context.report({ loc: node.loc, messageId: 'linkWithoutResolve' });
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
						!expressionIsAbsolute(node.value[0], context) &&
						!expressionIsFragment(node.value[0], context)) ||
					(node.value[0].type === 'SvelteMustacheTag' &&
						!expressionIsAbsolute(node.value[0].expression, context) &&
						!expressionIsFragment(node.value[0].expression, context) &&
						!isResolveCall(context, node.value[0].expression, resolveReferences))
				) {
					context.report({ loc: node.value[0].loc, messageId: 'linkWithoutResolve' });
				}
			}
		};
	}
});

// Extract all imports of the resolve() function

function extractResolveReferences(
	referenceTracker: ReferenceTracker,
	context: RuleContext
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

function extractFunctionCallReferences(referenceTracker: ReferenceTracker): {
	goto: TSESTree.CallExpression[];
	pushState: TSESTree.CallExpression[];
	replaceState: TSESTree.CallExpression[];
} {
	const rawReferences = Array.from(
		referenceTracker.iterateEsmReferences({
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
		})
	);
	return {
		goto: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'goto')
			.map(({ node }) => node as TSESTree.CallExpression),
		pushState: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'pushState')
			.map(({ node }) => node as TSESTree.CallExpression),
		replaceState: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'replaceState')
			.map(({ node }) => node as TSESTree.CallExpression)
	};
}

// Actual function checking

function checkGotoCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>
): void {
	if (call.arguments.length < 1) {
		return;
	}
	const url = call.arguments[0];
	if (!isResolveCall(context, url, resolveReferences)) {
		context.report({ loc: url.loc, messageId: 'gotoWithoutResolve' });
	}
}

function checkShallowNavigationCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	messageId: string
): void {
	if (call.arguments.length < 1) {
		return;
	}
	const url = call.arguments[0];
	if (!expressionIsEmpty(url) && !isResolveCall(context, url, resolveReferences)) {
		context.report({ loc: url.loc, messageId });
	}
}

// Helper functions

function isResolveCall(
	context: RuleContext,
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
	if (node.type === 'Identifier') {
		const variable = findVariable(context, node);
		if (
			variable !== null &&
			variable.identifiers.length > 0 &&
			variable.identifiers[0].parent.type === 'VariableDeclarator' &&
			variable.identifiers[0].parent.init !== null &&
			isResolveCall(context, variable.identifiers[0].parent.init, resolveReferences)
		) {
			return true;
		}
	}
	return false;
}

function expressionIsEmpty(url: TSESTree.CallExpressionArgument): boolean {
	return (
		(url.type === 'Literal' && url.value === '') ||
		(url.type === 'TemplateLiteral' &&
			url.expressions.length === 0 &&
			url.quasis.length === 1 &&
			url.quasis[0].value.raw === '')
	);
}

function expressionIsAbsolute(
	url: AST.SvelteLiteral | TSESTree.Expression,
	context: RuleContext
): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsolute(url, context);
		case 'Identifier':
			return identifierIsAbsolute(url, context);
		case 'Literal':
			return typeof url.value === 'string' && urlValueIsAbsolute(url.value);
		case 'SvelteLiteral':
			return urlValueIsAbsolute(url.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsolute(url, context);
		default:
			return false;
	}
}

function binaryExpressionIsAbsolute(url: TSESTree.BinaryExpression, context: RuleContext): boolean {
	return (
		(url.left.type !== 'PrivateIdentifier' && expressionIsAbsolute(url.left, context)) ||
		expressionIsAbsolute(url.right, context)
	);
}

function identifierIsAbsolute(url: TSESTree.Identifier, context: RuleContext): boolean {
	const variable = findVariable(context, url);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionIsAbsolute(variable.identifiers[0].parent.init, context);
}

function templateLiteralIsAbsolute(url: TSESTree.TemplateLiteral, context: RuleContext): boolean {
	return (
		url.expressions.some((expression) => expressionIsAbsolute(expression, context)) ||
		url.quasis.some((quasi) => urlValueIsAbsolute(quasi.value.raw))
	);
}

function urlValueIsAbsolute(url: string): boolean {
	return /^[+a-z]*:/i.test(url);
}

function expressionIsFragment(
	url: AST.SvelteLiteral | TSESTree.Expression,
	context: RuleContext
): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionIsFragment(url, context);
		case 'Identifier':
			return identifierIsFragment(url, context);
		case 'Literal':
			return typeof url.value === 'string' && urlValueIsFragment(url.value);
		case 'SvelteLiteral':
			return urlValueIsFragment(url.value);
		case 'TemplateLiteral':
			return templateLiteralIsFragment(url, context);
		default:
			return false;
	}
}

function binaryExpressionIsFragment(url: TSESTree.BinaryExpression, context: RuleContext): boolean {
	return url.left.type !== 'PrivateIdentifier' && expressionIsFragment(url.left, context);
}

function identifierIsFragment(url: TSESTree.Identifier, context: RuleContext): boolean {
	const variable = findVariable(context, url);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionIsFragment(variable.identifiers[0].parent.init, context);
}

function templateLiteralIsFragment(url: TSESTree.TemplateLiteral, context: RuleContext): boolean {
	return (
		(url.expressions.length >= 1 && expressionIsFragment(url.expressions[0], context)) ||
		(url.quasis.length >= 1 && urlValueIsFragment(url.quasis[0].value.raw))
	);
}

function urlValueIsFragment(url: string): boolean {
	return url.startsWith('#');
}
