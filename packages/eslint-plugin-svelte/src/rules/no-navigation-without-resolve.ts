import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { FindVariableContext } from '../utils/ast-utils.js';
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
			gotoWithoutResolve: 'Unexpected goto() call without resolve().',
			linkWithoutResolve: 'Unexpected href link without resolve().',
			pushStateWithoutResolve: 'Unexpected pushState() call without resolve().',
			replaceStateWithoutResolve: 'Unexpected replaceState() call without resolve().'
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

		const ignoreGoto = context.options[0]?.ignoreGoto ?? false;
		const ignorePushState = context.options[0]?.ignorePushState ?? false;
		const ignoreReplaceState = context.options[0]?.ignoreReplaceState ?? false;
		const ignoreLinks = context.options[0]?.ignoreLinks ?? false;

		return {
			Program() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				resolveReferences = extractResolveReferences(referenceTracker, context);
				const {
					goto: gotoCalls,
					pushState: pushStateCalls,
					replaceState: replaceStateCalls
				} = extractFunctionCallReferences(referenceTracker);
				if (!ignoreGoto) {
					for (const gotoCall of gotoCalls) {
						checkGotoCall(context, gotoCall, resolveReferences);
					}
				}
				if (!ignorePushState) {
					for (const pushStateCall of pushStateCalls) {
						checkShallowNavigationCall(
							context,
							pushStateCall,
							resolveReferences,
							'pushStateWithoutResolve'
						);
					}
				}
				if (!ignoreReplaceState) {
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
					ignoreLinks ||
					node.parent.parent.type !== 'SvelteElement' ||
					node.parent.parent.kind !== 'html' ||
					node.parent.parent.name.type !== 'SvelteName' ||
					node.parent.parent.name.name !== 'a' ||
					node.key.name !== 'href' ||
					node.value.type !== 'Identifier' ||
					hasRelExternal(new FindVariableContext(context), node.parent)
				) {
					return;
				}
				if (
					!expressionIsAbsolute(new FindVariableContext(context), node.value) &&
					!expressionIsFragment(new FindVariableContext(context), node.value) &&
					!isResolveCall(new FindVariableContext(context), node.value, resolveReferences)
				) {
					context.report({ loc: node.loc, messageId: 'linkWithoutResolve' });
				}
			},
			SvelteAttribute(node) {
				if (
					ignoreLinks ||
					node.parent.parent.type !== 'SvelteElement' ||
					node.parent.parent.kind !== 'html' ||
					node.parent.parent.name.type !== 'SvelteName' ||
					node.parent.parent.name.name !== 'a' ||
					node.key.name !== 'href' ||
					hasRelExternal(new FindVariableContext(context), node.parent)
				) {
					return;
				}
				if (
					(node.value[0].type === 'SvelteLiteral' &&
						!expressionIsNullish(new FindVariableContext(context), node.value[0]) &&
						!expressionIsAbsolute(new FindVariableContext(context), node.value[0]) &&
						!expressionIsFragment(new FindVariableContext(context), node.value[0])) ||
					(node.value[0].type === 'SvelteMustacheTag' &&
						!expressionIsNullish(new FindVariableContext(context), node.value[0].expression) &&
						!expressionIsAbsolute(new FindVariableContext(context), node.value[0].expression) &&
						!expressionIsFragment(new FindVariableContext(context), node.value[0].expression) &&
						!isResolveCall(
							new FindVariableContext(context),
							node.value[0].expression,
							resolveReferences
						))
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
			asset: {
				[ReferenceTracker.READ]: true
			},
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
	if (!isResolveCall(new FindVariableContext(context), url, resolveReferences)) {
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
	if (
		!expressionIsEmpty(url) &&
		!isResolveCall(new FindVariableContext(context), url, resolveReferences)
	) {
		context.report({ loc: url.loc, messageId });
	}
}

// Helper functions

function isResolveCall(
	ctx: FindVariableContext,
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
	const variable = ctx.findVariable(node);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return isResolveCall(ctx, variable.identifiers[0].parent.init, resolveReferences);
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

function expressionIsNullish(
	ctx: FindVariableContext,
	url: AST.SvelteLiteral | TSESTree.Expression
): boolean {
	switch (url.type) {
		case 'Identifier':
			return identifierIsNullish(ctx, url);
		case 'Literal':
			return url.value === null; // Undefined is an Identifier in ESTree, null is a Literal
		default:
			return false;
	}
}

function identifierIsNullish(ctx: FindVariableContext, url: TSESTree.Identifier): boolean {
	if (url.name === 'undefined') {
		return true;
	}
	const variable = ctx.findVariable(url);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionIsNullish(ctx, variable.identifiers[0].parent.init);
}

function expressionIsAbsolute(
	ctx: FindVariableContext,
	url: AST.SvelteLiteral | TSESTree.Expression
): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsolute(ctx, url);
		case 'Identifier':
			return identifierIsAbsolute(ctx, url);
		case 'Literal':
			return typeof url.value === 'string' && urlValueIsAbsolute(url.value);
		case 'SvelteLiteral':
			return urlValueIsAbsolute(url.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsolute(ctx, url);
		default:
			return false;
	}
}

function binaryExpressionIsAbsolute(
	ctx: FindVariableContext,
	url: TSESTree.BinaryExpression
): boolean {
	return (
		(url.left.type !== 'PrivateIdentifier' && expressionIsAbsolute(ctx, url.left)) ||
		expressionIsAbsolute(ctx, url.right)
	);
}

function identifierIsAbsolute(ctx: FindVariableContext, url: TSESTree.Identifier): boolean {
	const variable = ctx.findVariable(url);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionIsAbsolute(ctx, variable.identifiers[0].parent.init);
}

function templateLiteralIsAbsolute(
	ctx: FindVariableContext,
	url: TSESTree.TemplateLiteral
): boolean {
	return (
		url.expressions.some((expression) => expressionIsAbsolute(ctx, expression)) ||
		url.quasis.some((quasi) => urlValueIsAbsolute(quasi.value.raw))
	);
}

function urlValueIsAbsolute(url: string): boolean {
	return /^[+a-z]*:/i.test(url);
}

function expressionIsFragment(
	ctx: FindVariableContext,
	url: AST.SvelteLiteral | TSESTree.Expression
): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionIsFragment(ctx, url);
		case 'Identifier':
			return identifierIsFragment(ctx, url);
		case 'Literal':
			return typeof url.value === 'string' && urlValueIsFragment(url.value);
		case 'SvelteLiteral':
			return urlValueIsFragment(url.value);
		case 'TemplateLiteral':
			return templateLiteralIsFragment(ctx, url);
		default:
			return false;
	}
}

function binaryExpressionIsFragment(
	ctx: FindVariableContext,
	url: TSESTree.BinaryExpression
): boolean {
	return url.left.type !== 'PrivateIdentifier' && expressionIsFragment(ctx, url.left);
}

function identifierIsFragment(ctx: FindVariableContext, url: TSESTree.Identifier): boolean {
	const variable = ctx.findVariable(url);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionIsFragment(ctx, variable.identifiers[0].parent.init);
}

function templateLiteralIsFragment(
	ctx: FindVariableContext,
	url: TSESTree.TemplateLiteral
): boolean {
	return (
		(url.expressions.length >= 1 && expressionIsFragment(ctx, url.expressions[0])) ||
		(url.quasis.length >= 1 && urlValueIsFragment(url.quasis[0].value.raw))
	);
}

function urlValueIsFragment(url: string): boolean {
	return url.startsWith('#');
}

function hasRelExternal(ctx: FindVariableContext, element: AST.SvelteStartTag): boolean {
	function identifierIsExternal(identifier: TSESTree.Identifier): boolean {
		const variable = ctx.findVariable(identifier);
		return (
			variable !== null &&
			variable.identifiers.length > 0 &&
			variable.identifiers[0].parent.type === 'VariableDeclarator' &&
			variable.identifiers[0].parent.init !== null &&
			variable.identifiers[0].parent.init.type === 'Literal' &&
			variable.identifiers[0].parent.init.value === 'external'
		);
	}

	for (const attr of element.attributes) {
		if (
			(attr.type === 'SvelteAttribute' &&
				attr.key.name === 'rel' &&
				((attr.value[0].type === 'SvelteLiteral' &&
					attr.value[0].value.split(/\s+/).includes('external')) ||
					(attr.value[0].type === 'SvelteMustacheTag' &&
						((attr.value[0].expression.type === 'Literal' &&
							attr.value[0].expression.value?.toString().split(/\s+/).includes('external')) ||
							(attr.value[0].expression.type === 'Identifier' &&
								identifierIsExternal(attr.value[0].expression)))))) ||
			(attr.type === 'SvelteShorthandAttribute' &&
				attr.key.name === 'rel' &&
				attr.value.type === 'Identifier' &&
				identifierIsExternal(attr.value))
		) {
			return true;
		}
	}
	return false;
}
