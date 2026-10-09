import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { FindVariableContext } from '../utils/ast-utils.js';
import { findVariable } from '../utils/ast-utils.js';
import type { RuleContext } from '../types.js';
import type { Variable } from '@typescript-eslint/scope-manager';
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
				svelteKitVersions: ['1.0.0-next', '1', '2', '3']
			}
		]
	},
	create(context) {
		const tsTools = getTypeScriptTools(context);

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
						checkGotoCall(context, gotoCall, resolveReferences, tsTools);
					}
				}
				if (!ignorePushState) {
					for (const pushStateCall of pushStateCalls) {
						checkShallowNavigationCall(
							context,
							pushStateCall,
							resolveReferences,
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
							tsTools,
							'replaceStateWithoutResolve'
						);
					}
				}
			},
			...(!ignoreLinks && {
				SvelteShorthandAttribute(node) {
					checkLinkAttribute(context, node, [node.value], resolveReferences, tsTools);
				},
				SvelteAttribute(node) {
					if (node.value.length > 0) {
						checkLinkAttribute(
							context,
							node,
							node.value.map((part) =>
								part.type === 'SvelteMustacheTag' ? part.expression : part
							),
							resolveReferences,
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

// Actual function checking

function checkGotoCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(context, [call.arguments[0]], resolveReferences, tsTools, {})
	) {
		context.report({ loc: call.arguments[0].loc, messageId: 'gotoWithoutResolve' });
	}
}

function checkShallowNavigationCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	messageId: string
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(context, [call.arguments[0]], resolveReferences, tsTools, {
			allowEmpty: true
		})
	) {
		context.report({ loc: call.arguments[0].loc, messageId });
	}
}

function checkLinkAttribute(
	context: RuleContext,
	attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute,
	value: UrlPart[],
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null
): void {
	if (
		attribute.parent.parent.type === 'SvelteElement' &&
		attribute.parent.parent.kind === 'html' &&
		attribute.parent.parent.name.type === 'SvelteName' &&
		attribute.parent.parent.name.name === 'a' &&
		attribute.key.name === 'href' &&
		!hasRelExternal(new FindVariableContext(context), attribute.parent) &&
		!isValueAllowed(context, value, resolveReferences, tsTools, {
			allowAbsolute: true,
			allowNullish: true
		})
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

// A URL is given as a list of parts that are concatenated together.
type UrlPart =
	| TSESTree.CallExpressionArgument
	| TSESTree.Expression
	| TSESTree.TemplateElement
	| AST.SvelteLiteral;

// A URL is allowed if it starts with a resolved value that is followed by nothing, a query or a fragment (appending a path would bypass the route type-checking of resolve()). It is also allowed if it starts with a query or a fragment (it then keeps the current path) or, depending on the config, if it is empty or nullish, or if it starts with an absolute URL.
function isValueAllowed(
	context: RuleContext,
	value: UrlPart[],
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	config: {
		allowAbsolute?: boolean;
		allowEmpty?: boolean;
		allowNullish?: boolean;
	}
): boolean {
	if (
		config.allowAbsolute &&
		value.length === 1 &&
		value[0].type !== 'TemplateElement' &&
		expressionIsAbsoluteUrl(value[0])
	) {
		return true;
	}
	return urlStartSatisfies(context, value, new Set(), (first, rest, visited) => {
		if (first === null) {
			return config.allowEmpty === true;
		}
		const allowNullish = config.allowNullish === true && rest.length === 0;
		return (
			(allowNullish && first.type !== 'TemplateElement' && expressionIsNullish(first)) ||
			partStartsWith(first, '?') ||
			partStartsWith(first, '#') ||
			(config.allowAbsolute === true && partIsAbsoluteUrl(first)) ||
			(partIsResolved(context, first, resolveReferences, allowNullish, tsTools) &&
				urlStartSatisfies(
					context,
					rest,
					visited,
					(suffixFirst) =>
						suffixFirst === null ||
						partStartsWith(suffixFirst, '?') ||
						partStartsWith(suffixFirst, '#')
				))
		);
	});
}

// Checks `predicate` against every possible first part of the URL, together with the parts following it. Empty parts are skipped, and concatenations, template literals, variables and ternaries are expanded, so that `predicate` only gets indivisible parts (or null if the URL is empty). `visited` contains the variables already expanded on the current path, so that cyclic variable definitions terminate.
function urlStartSatisfies(
	context: RuleContext,
	parts: UrlPart[],
	visited: ReadonlySet<Variable>,
	predicate: (first: UrlPart | null, rest: UrlPart[], visited: ReadonlySet<Variable>) => boolean
): boolean {
	if (parts.length === 0) {
		return predicate(null, [], visited);
	}
	const [first, ...rest] = parts;
	if (partIsEmpty(first)) {
		return urlStartSatisfies(context, rest, visited, predicate);
	}
	if (first.type === 'BinaryExpression' && first.operator === '+') {
		return urlStartSatisfies(context, [first.left, first.right, ...rest], visited, predicate);
	}
	if (first.type === 'TemplateLiteral') {
		const templateParts = [...first.quasis, ...first.expressions].sort(
			(a, b) => a.range[0] - b.range[0]
		);
		return urlStartSatisfies(context, [...templateParts, ...rest], visited, predicate);
	}
	if (first.type === 'ConditionalExpression') {
		return (
			urlStartSatisfies(context, [first.consequent, ...rest], visited, predicate) &&
			urlStartSatisfies(context, [first.alternate, ...rest], visited, predicate)
		);
	}
	if (first.type === 'Identifier') {
		if (predicate(first, rest, visited)) {
			return true;
		}
		// `visited` is used instead of FindVariableContext, because the guard needs to be per path: the branches of a ternary share the parts following it, and each needs to expand their variables.
		// eslint-disable-next-line internal/prefer-find-variable-safe -- guarded by `visited`
		const variable = findVariable(context, first);
		if (
			variable === null ||
			visited.has(variable) ||
			variable.identifiers.length === 0 ||
			variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
			variable.identifiers[0].parent.init === null
		) {
			return false;
		}
		return urlStartSatisfies(
			context,
			[variable.identifiers[0].parent.init, ...rest],
			new Set([...visited, variable]),
			predicate
		);
	}
	return predicate(first, rest, visited);
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

function partIsResolved(
	context: RuleContext,
	part: UrlPart,
	resolveReferences: Set<TSESTree.Identifier>,
	allowNullish: boolean,
	tsTools: TSTools | null
): boolean {
	if (
		part.type === 'CallExpression' &&
		((part.callee.type === 'Identifier' && resolveReferences.has(part.callee)) ||
			(part.callee.type === 'MemberExpression' &&
				part.callee.property.type === 'Identifier' &&
				resolveReferences.has(part.callee.property)))
	) {
		return true;
	}
	if (part.type === 'TemplateElement') {
		return false;
	}
	if (expressionIsAllowedType(part, allowNullish, tsTools)) {
		return true;
	}
	if (part.type !== 'Identifier') {
		return false;
	}
	const variable = findVariable(context, part);
	return (
		variable !== null &&
		variable.identifiers.length > 0 &&
		expressionIsAllowedType(variable.identifiers[0], allowNullish, tsTools)
	);
}

function partIsEmpty(part: UrlPart): boolean {
	return partText(part) === '';
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

function expressionIsAbsoluteUrl(
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral
): boolean {
	switch (node.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsoluteUrl(node);
		case 'Literal':
			return typeof node.value === 'string' && valueIsAbsoluteUrl(node.value);
		case 'SvelteLiteral':
			return valueIsAbsoluteUrl(node.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsoluteUrl(node);
		default:
			return false;
	}
}

function binaryExpressionIsAbsoluteUrl(node: TSESTree.BinaryExpression): boolean {
	return (
		node.operator === '+' &&
		(expressionIsAbsoluteUrl(node.left) || expressionIsAbsoluteUrl(node.right))
	);
}

function templateLiteralIsAbsoluteUrl(node: TSESTree.TemplateLiteral): boolean {
	return (
		node.expressions.some((expression) => expressionIsAbsoluteUrl(expression)) ||
		node.quasis.some((quasi) => valueIsAbsoluteUrl(quasi.value.raw))
	);
}

function valueIsAbsoluteUrl(node: string): boolean {
	return /^[+a-z]*:/i.test(node);
}

function partIsAbsoluteUrl(part: UrlPart): boolean {
	const text = partText(part);
	return text !== null && valueIsAbsoluteUrl(text);
}

function partStartsWith(part: UrlPart, prefix: string): boolean {
	const text = partText(part);
	return text !== null && text.startsWith(prefix);
}

// The text of a part, if it is a string literal
function partText(part: UrlPart): string | null {
	switch (part.type) {
		case 'Literal':
			return typeof part.value === 'string' ? part.value : null;
		case 'SvelteLiteral':
			return part.value;
		case 'TemplateElement':
			return part.value.raw;
		default:
			return null;
	}
}
