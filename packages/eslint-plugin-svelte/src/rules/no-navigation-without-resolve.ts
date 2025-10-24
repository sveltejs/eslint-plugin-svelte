import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type { TrackedReferences } from '@eslint-community/eslint-utils';
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
					},
					allowSuffix: {
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
		let assetReferences: Set<TSESTree.Identifier> = new Set<TSESTree.Identifier>();
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				({ resolve: resolveReferences, asset: assetReferences } = extractResolveReferences(
					referenceTracker,
					context
				));
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
						!expressionIsAbsolute(new FindVariableContext(context), node.value[0]) &&
						!expressionIsFragment(new FindVariableContext(context), node.value[0])) ||
					(node.value[0].type === 'SvelteMustacheTag' &&
						!expressionIsAbsolute(new FindVariableContext(context), node.value[0].expression) &&
						!expressionIsFragment(new FindVariableContext(context), node.value[0].expression) &&
						!isResolveWithOptionalSuffix(
							new FindVariableContext(context),
							node.value[0].expression,
							resolveReferences,
							context.options[0]?.allowSuffix !== false
						) &&
						!isAssetOnly(
							new FindVariableContext(context),
							node.value[0].expression,
							assetReferences
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
): { resolve: Set<TSESTree.Identifier>; asset: Set<TSESTree.Identifier> } {
	const resolveSet = new Set<TSESTree.Identifier>();
	const assetSet = new Set<TSESTree.Identifier>();
	for (const { node, path } of referenceTracker.iterateEsmReferences({
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
				if (reference.identifier.type !== 'Identifier') continue;
				if (path[path.length - 1] === 'resolve') resolveSet.add(reference.identifier);
				if (path[path.length - 1] === 'asset') assetSet.add(reference.identifier);
			}
		} else if (node.type === 'MemberExpression' && node.property.type === 'Identifier') {
			if (node.property.name === 'resolve') resolveSet.add(node.property);
			if (node.property.name === 'asset') assetSet.add(node.property);
		}
	}
	return { resolve: resolveSet, asset: assetSet };
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

	function onlyCallExpressions(list: TrackedReferences<boolean>[]): TSESTree.CallExpression[] {
		return list
			.filter((r) => r.node.type === 'CallExpression')
			.map((r) => r.node as TSESTree.CallExpression);
	}

	return {
		goto: onlyCallExpressions(rawReferences.filter(({ path }) => path[path.length - 1] === 'goto')),
		pushState: onlyCallExpressions(
			rawReferences.filter(({ path }) => path[path.length - 1] === 'pushState')
		),
		replaceState: onlyCallExpressions(
			rawReferences.filter(({ path }) => path[path.length - 1] === 'replaceState')
		)
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
	if (
		!isResolveWithOptionalSuffix(
			new FindVariableContext(context),
			url,
			resolveReferences,
			context.options[0]?.allowSuffix !== false
		)
	) {
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
		!isResolveWithOptionalSuffix(
			new FindVariableContext(context),
			url,
			resolveReferences,
			context.options[0]?.allowSuffix !== false
		)
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

function isResolveWithOptionalSuffix(
	ctx: FindVariableContext,
	node: TSESTree.Expression | TSESTree.CallExpressionArgument,
	resolveReferences: Set<TSESTree.Identifier>,
	allowSuffix: boolean
): boolean {
	if (
		(node.type === 'CallExpression' || node.type === 'Identifier') &&
		isResolveCall(ctx, node, resolveReferences)
	) {
		return true;
	}

	if (!allowSuffix) return false;
	return expressionStartsWithResolve(ctx, node, resolveReferences);
}

function expressionStartsWithResolve(
	ctx: FindVariableContext,
	node: TSESTree.Expression | TSESTree.CallExpressionArgument,
	resolveReferences: Set<TSESTree.Identifier>
): boolean {
	// Direct call
	if (node.type === 'CallExpression') {
		return isResolveCall(ctx, node, resolveReferences);
	}
	// Binary chain: ensure the left-most operand is resolve(); any right-hand content is allowed
	if (node.type === 'BinaryExpression') {
		if (node.operator !== '+' || node.left.type === 'PrivateIdentifier') return false;
		return expressionStartsWithResolve(ctx, node.left, resolveReferences);
	}
	// Template literal: must start with expression and that expression starts with resolve(); content after is allowed
	if (node.type === 'TemplateLiteral') {
		if (
			node.expressions.length === 0 ||
			(node.quasis.length >= 1 && node.quasis[0].value.raw !== '')
		)
			return false;
		return expressionStartsWithResolve(ctx, node.expressions[0], resolveReferences);
	}
	// Identifier indirection
	if (node.type === 'Identifier') {
		const variable = ctx.findVariable(node);
		if (
			variable === null ||
			variable.identifiers.length === 0 ||
			variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
			variable.identifiers[0].parent.init === null
		) {
			return false;
		}
		return expressionStartsWithResolve(ctx, variable.identifiers[0].parent.init, resolveReferences);
	}
	return false;
}

function isAssetOnly(
	ctx: FindVariableContext,
	node: TSESTree.Expression | TSESTree.CallExpressionArgument,
	assetReferences: Set<TSESTree.Identifier>
): boolean {
	if (node.type === 'CallExpression') {
		return (
			(node.callee.type === 'Identifier' && assetReferences.has(node.callee)) ||
			(node.callee.type === 'MemberExpression' &&
				node.callee.property.type === 'Identifier' &&
				assetReferences.has(node.callee.property))
		);
	}
	if (node.type === 'Identifier') {
		const variable = ctx.findVariable(node);
		if (
			variable === null ||
			variable.identifiers.length === 0 ||
			variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
			variable.identifiers[0].parent.init === null
		) {
			return false;
		}
		return isAssetOnly(ctx, variable.identifiers[0].parent.init, assetReferences);
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
