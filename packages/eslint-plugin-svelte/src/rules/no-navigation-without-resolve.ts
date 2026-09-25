import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { FindVariableContext } from '../utils/ast-utils.js';
import { findVariable } from '../utils/ast-utils.js';
import type { RuleContext } from '../types.js';
import type { AST } from 'svelte-eslint-parser';
import {
	type TSTools,
	getTypeScriptTools,
	isNullType,
	isUndefinedType
} from '../utils/ts-utils/index.js';

export default createRule('no-navigation-without-resolve', {
	meta: {
		docs: {
			description:
				'disallow internal navigation (links, `goto()`, `pushState()`, `replaceState()`) without a `resolve()`',
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
		const tsTools = getTypeScriptTools(context);

		let resolveReferences: Set<TSESTree.Identifier> = new Set<TSESTree.Identifier>();
		let urlReferences: UrlReferences = {
			constructions: new Set<TSESTree.NewExpression>(),
			stringCalls: new Set<TSESTree.CallExpression>()
		};

		const ignoreGoto = context.options[0]?.ignoreGoto ?? false;
		const ignorePushState = context.options[0]?.ignorePushState ?? false;
		const ignoreReplaceState = context.options[0]?.ignoreReplaceState ?? false;
		const ignoreLinks = context.options[0]?.ignoreLinks ?? false;

		return {
			Program() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				resolveReferences = extractResolveReferences(referenceTracker, context);
				urlReferences = extractUrlReferences(referenceTracker);
				const {
					goto: gotoCalls,
					pushState: pushStateCalls,
					replaceState: replaceStateCalls
				} = extractFunctionCallReferences(referenceTracker);
				if (!ignoreGoto) {
					for (const gotoCall of gotoCalls) {
						checkGotoCall(context, gotoCall, resolveReferences, urlReferences, tsTools);
					}
				}
				if (!ignorePushState) {
					for (const pushStateCall of pushStateCalls) {
						checkShallowNavigationCall(
							context,
							pushStateCall,
							resolveReferences,
							urlReferences,
							tsTools,
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
							urlReferences,
							tsTools,
							'replaceStateWithoutResolve'
						);
					}
				}
			},
			...(!ignoreLinks && {
				SvelteShorthandAttribute(node) {
					checkLinkAttribute(context, node, node.value, resolveReferences, urlReferences, tsTools);
				},
				SvelteAttribute(node) {
					if (node.value.length > 0) {
						checkLinkAttribute(
							context,
							node,
							node.value[0].type === 'SvelteMustacheTag' ? node.value[0].expression : node.value[0],
							resolveReferences,
							urlReferences,
							tsTools
						);
					}
				}
			})
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

interface UrlReferences {
	constructions: Set<TSESTree.NewExpression>;
	stringCalls: Set<TSESTree.CallExpression>;
}

function extractUrlReferences(referenceTracker: ReferenceTracker): UrlReferences {
	const constructions = new Set<TSESTree.NewExpression>();
	const stringCalls = new Set<TSESTree.CallExpression>();
	for (const { node, path } of referenceTracker.iterateGlobalReferences({
		URL: {
			[ReferenceTracker.CONSTRUCT]: true
		},
		String: {
			[ReferenceTracker.CALL]: true
		}
	})) {
		if (path[path.length - 1] === 'URL') {
			constructions.add(node as TSESTree.NewExpression);
		} else if (path[path.length - 1] === 'String') {
			stringCalls.add(node as TSESTree.CallExpression);
		}
	}
	return { constructions, stringCalls };
}

// Actual function checking

function checkGotoCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	urlReferences: UrlReferences,
	tsTools: TSTools | null
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(
			new FindVariableContext(context),
			call.arguments[0],
			resolveReferences,
			urlReferences,
			tsTools,
			{}
		)
	) {
		context.report({ loc: call.arguments[0].loc, messageId: 'gotoWithoutResolve' });
	}
}

function checkShallowNavigationCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	urlReferences: UrlReferences,
	tsTools: TSTools | null,
	messageId: string
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(
			new FindVariableContext(context),
			call.arguments[0],
			resolveReferences,
			urlReferences,
			tsTools,
			{
				allowEmpty: true
			}
		)
	) {
		context.report({ loc: call.arguments[0].loc, messageId });
	}
}

function checkLinkAttribute(
	context: RuleContext,
	attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute,
	value: TSESTree.Expression | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>,
	urlReferences: UrlReferences,
	tsTools: TSTools | null
): void {
	if (
		attribute.parent.parent.type === 'SvelteElement' &&
		attribute.parent.parent.kind === 'html' &&
		attribute.parent.parent.name.type === 'SvelteName' &&
		attribute.parent.parent.name.name === 'a' &&
		attribute.key.name === 'href' &&
		!hasRelExternal(new FindVariableContext(context), attribute.parent) &&
		!isValueAllowed(
			new FindVariableContext(context),
			value,
			resolveReferences,
			urlReferences,
			tsTools,
			{
				allowAbsolute: true,
				allowFragment: true,
				allowNullish: true
			}
		)
	) {
		context.report({ loc: attribute.loc, messageId: 'linkWithoutResolve' });
	}
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

function isValueAllowed(
	ctx: FindVariableContext,
	value: TSESTree.CallExpressionArgument | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>,
	urlReferences: UrlReferences,
	tsTools: TSTools | null,
	config: {
		allowAbsolute?: boolean;
		allowEmpty?: boolean;
		allowFragment?: boolean;
		allowNullish?: boolean;
	}
): boolean {
	if (value.type === 'Identifier') {
		const variable = ctx.findVariable(value);
		if (
			variable !== null &&
			variable.identifiers.length > 0 &&
			variable.identifiers[0].parent.type === 'VariableDeclarator'
		) {
			if (expressionIsAllowedType(variable.identifiers[0], config.allowNullish, tsTools)) {
				return true;
			}
			if (variable.identifiers[0].parent.init !== null) {
				return isValueAllowed(
					ctx,
					variable.identifiers[0].parent.init,
					resolveReferences,
					urlReferences,
					tsTools,
					config
				);
			}
		}
	}
	if (value.type === 'ConditionalExpression') {
		return (
			isValueAllowed(ctx, value.consequent, resolveReferences, urlReferences, tsTools, config) &&
			isValueAllowed(ctx, value.alternate, resolveReferences, urlReferences, tsTools, config)
		);
	}
	if (
		(config.allowAbsolute && expressionIsAbsoluteUrl(ctx, value, urlReferences)) ||
		(config.allowEmpty && expressionIsEmpty(value)) ||
		(config.allowFragment && expressionStartsWith(ctx, value, '#')) ||
		(config.allowNullish && expressionIsNullish(value)) ||
		expressionIsAllowedType(value, config.allowNullish, tsTools) ||
		expressionIsResolveCall(ctx, value, resolveReferences)
	) {
		return true;
	}
	return false;
}

// Helper functions

function expressionIsAllowedType(
	value: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral,
	allowNullish: boolean | undefined,
	tsTools: TSTools | null
): boolean {
	if (tsTools === null) {
		return false;
	}
	const checker = tsTools.service.program.getTypeChecker();

	const tsNode = tsTools.service.esTreeNodeToTSNodeMap.get(value);
	if (tsNode === undefined) {
		return false;
	}
	let nodeType = checker.getTypeAtLocation(tsNode);
	if (allowNullish === true) {
		if (isNullType(nodeType, tsTools.ts) || isUndefinedType(nodeType, tsTools.ts)) {
			return true;
		}
		nodeType = checker.getNonNullableType(nodeType);
	}

	const appTypesModule = checker.getAmbientModules().find((m) => m.name === '"$app/types"');
	if (!appTypesModule) {
		return false;
	}

	const resolvedPathnameSymbol = checker
		.getExportsOfModule(appTypesModule)
		.find((e) => e.name === 'ResolvedPathname');
	if (!resolvedPathnameSymbol) {
		return false;
	}
	const resolvedPathnameType = checker.getDeclaredTypeOfSymbol(resolvedPathnameSymbol);

	// getTypeAtLocation returns the resolved (structural) type without alias information, so we cannot compare aliasSymbols directly. Instead we check structural equivalence by testing assignability in both directions: this correctly rejects strict subtypes like Pathname (Pathname ⊂ ResolvedPathname, so only one direction holds).
	return (
		checker.isTypeAssignableTo(nodeType, resolvedPathnameType) &&
		checker.isTypeAssignableTo(resolvedPathnameType, nodeType)
	);
}

function expressionIsResolveCall(
	ctx: FindVariableContext,
	node: TSESTree.CallExpressionArgument | AST.SvelteLiteral,
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
	return expressionIsResolveCall(ctx, variable.identifiers[0].parent.init, resolveReferences);
}

function expressionIsEmpty(
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral
): boolean {
	return (
		(node.type === 'Literal' && node.value === '') ||
		(node.type === 'TemplateLiteral' &&
			node.expressions.length === 0 &&
			node.quasis.length === 1 &&
			node.quasis[0].value.raw === '')
	);
}

function expressionIsNullish(
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral
): boolean {
	switch (node.type) {
		case 'Identifier':
			return node.name === 'undefined';
		case 'Literal':
			return node.value === null; // Undefined is an Identifier in ESTree, null is a Literal
		default:
			return false;
	}
}

function expressionIsUrl(
	ctx: FindVariableContext,
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral,
	urlReferences: UrlReferences
): boolean {
	if (node.type === 'NewExpression') {
		return urlReferences.constructions.has(node);
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
	return expressionIsUrl(ctx, variable.identifiers[0].parent.init, urlReferences);
}

function expressionIsUrlHref(
	ctx: FindVariableContext,
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral,
	urlReferences: UrlReferences
): boolean {
	if (expressionIsUrl(ctx, node, urlReferences)) {
		return true;
	}
	if (
		node.type === 'MemberExpression' &&
		!node.computed &&
		node.property.type === 'Identifier' &&
		(node.property.name === 'href' || node.property.name === 'origin')
	) {
		return expressionIsUrl(ctx, node.object, urlReferences);
	}
	if (node.type === 'CallExpression') {
		if (
			node.callee.type === 'MemberExpression' &&
			!node.callee.computed &&
			node.callee.property.type === 'Identifier' &&
			(node.callee.property.name === 'toString' || node.callee.property.name === 'toJSON')
		) {
			return expressionIsUrl(ctx, node.callee.object, urlReferences);
		}
		if (urlReferences.stringCalls.has(node) && node.arguments.length > 0) {
			return expressionIsUrl(ctx, node.arguments[0], urlReferences);
		}
	}
	return false;
}

function expressionIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral,
	urlReferences: UrlReferences
): boolean {
	if (expressionIsUrlHref(ctx, node, urlReferences)) {
		return true;
	}
	switch (node.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsoluteUrl(ctx, node, urlReferences);
		case 'Literal':
			return typeof node.value === 'string' && valueIsAbsoluteUrl(node.value);
		case 'SvelteLiteral':
			return valueIsAbsoluteUrl(node.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsoluteUrl(ctx, node, urlReferences);
		default:
			return false;
	}
}

function binaryExpressionIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.BinaryExpression,
	urlReferences: UrlReferences
): boolean {
	return (
		node.operator === '+' &&
		(expressionIsAbsoluteUrl(ctx, node.left, urlReferences) ||
			expressionIsAbsoluteUrl(ctx, node.right, urlReferences))
	);
}

function templateLiteralIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.TemplateLiteral,
	urlReferences: UrlReferences
): boolean {
	return (
		node.expressions.some((expression) =>
			expressionIsAbsoluteUrl(ctx, expression, urlReferences)
		) || node.quasis.some((quasi) => valueIsAbsoluteUrl(quasi.value.raw))
	);
}

function valueIsAbsoluteUrl(node: string): boolean {
	return /^[+a-z]*:/i.test(node);
}

function expressionStartsWith(
	ctx: FindVariableContext,
	node:
		| TSESTree.CallExpressionArgument
		| TSESTree.Expression
		| TSESTree.TemplateElement
		| AST.SvelteLiteral,
	prefix: string
): boolean {
	switch (node.type) {
		case 'BinaryExpression':
			return binaryExpressionStartsWith(ctx, node, prefix);
		case 'Identifier':
			return identifierStartsWith(ctx, node, prefix);
		case 'Literal':
			return typeof node.value === 'string' && node.value.startsWith(prefix);
		case 'SvelteLiteral':
			return node.value.startsWith(prefix);
		case 'TemplateElement':
			return node.value.raw.startsWith(prefix);
		case 'TemplateLiteral':
			return templateLiteralStartsWith(ctx, node, prefix);
		default:
			return false;
	}
}

function binaryExpressionStartsWith(
	ctx: FindVariableContext,
	node: TSESTree.BinaryExpression,
	prefix: string
): boolean {
	return node.operator === '+' && expressionStartsWith(ctx, node.left, prefix);
}

function identifierStartsWith(
	ctx: FindVariableContext,
	node: TSESTree.Identifier,
	prefix: string
): boolean {
	const variable = ctx.findVariable(node);
	if (
		variable === null ||
		variable.identifiers.length === 0 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return false;
	}
	return expressionStartsWith(ctx, variable.identifiers[0].parent.init, prefix);
}

function templateLiteralStartsWith(
	ctx: FindVariableContext,
	node: TSESTree.TemplateLiteral,
	prefix: string
): boolean {
	return (
		(node.expressions.length >= 1 && expressionStartsWith(ctx, node.expressions[0], prefix)) ||
		(node.quasis.length >= 1 && expressionStartsWith(ctx, node.quasis[0], prefix))
	);
}
