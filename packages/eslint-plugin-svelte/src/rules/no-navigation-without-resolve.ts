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
					checkLinkAttribute(context, node, node.value, resolveReferences, tsTools);
				},
				SvelteAttribute(node) {
					if (node.value.length > 0) {
						checkLinkAttribute(
							context,
							node,
							node.value[0].type === 'SvelteMustacheTag' ? node.value[0].expression : node.value[0],
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
		!isValueAllowed(
			new FindVariableContext(context),
			call.arguments[0],
			resolveReferences,
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
	tsTools: TSTools | null,
	messageId: string
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(
			new FindVariableContext(context),
			call.arguments[0],
			resolveReferences,
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
	tsTools: TSTools | null
): void {
	if (
		attribute.parent.parent.type === 'SvelteElement' &&
		attribute.parent.parent.kind === 'html' &&
		attribute.parent.parent.name.type === 'SvelteName' &&
		attribute.parent.parent.name.name === 'a' &&
		attribute.key.name === 'href' &&
		!hasRelExternal(new FindVariableContext(context), attribute.parent) &&
		!isValueAllowed(new FindVariableContext(context), value, resolveReferences, tsTools, {
			allowAbsolute: true,
			allowFragment: true,
			allowNullish: true
		})
	) {
		context.report({ loc: attribute.loc, messageId: 'linkWithoutResolve' });
	}
}

function hasRelExternal(ctx: FindVariableContext, element: AST.SvelteStartTag): boolean {
	function identifierIsExternal(identifier: TSESTree.Identifier): boolean {
		const init = resolveVariableInit(ctx, identifier);
		return init !== null && init.type === 'Literal' && init.value === 'external';
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

interface AllowedValueConfig {
	allowAbsolute?: boolean;
	allowEmpty?: boolean;
	allowFragment?: boolean;
	allowNullish?: boolean;
}

function isValueAllowed(
	ctx: FindVariableContext,
	value: TSESTree.CallExpressionArgument | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	config: AllowedValueConfig
): boolean {
	if (value.type === 'Identifier') {
		const binding = resolveBindingIdentifier(ctx, value);
		if (binding !== null) {
			if (binding.parent.type === 'VariableDeclarator') {
				return variableValueIsAllowed(ctx, binding, resolveReferences, tsTools, config);
			}
			if (eachItemValueIsAllowed(ctx, binding, undefined, resolveReferences, tsTools, config)) {
				return true;
			}
		}
	}
	if (
		value.type === 'MemberExpression' &&
		memberValueIsAllowed(ctx, value, resolveReferences, tsTools, config)
	) {
		return true;
	}
	if (value.type === 'ConditionalExpression') {
		return (
			isValueAllowed(ctx, value.consequent, resolveReferences, tsTools, config) &&
			isValueAllowed(ctx, value.alternate, resolveReferences, tsTools, config)
		);
	}
	if (
		(config.allowAbsolute && expressionIsAbsoluteUrl(ctx, value)) ||
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

function variableValueIsAllowed(
	ctx: FindVariableContext,
	binding: TSESTree.Identifier,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	config: AllowedValueConfig
): boolean {
	if (expressionIsAllowedType(binding, config.allowNullish, tsTools)) {
		return true;
	}
	if (binding.parent.type !== 'VariableDeclarator') {
		return false;
	}
	return (
		binding.parent.init !== null &&
		isValueAllowed(ctx, binding.parent.init, resolveReferences, tsTools, config)
	);
}

function eachItemValueIsAllowed(
	ctx: FindVariableContext,
	binding: TSESTree.Identifier,
	key: string | number | undefined,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	config: AllowedValueConfig
): boolean {
	const each = eachBlockOf(binding);
	if (each === null) {
		return false;
	}
	const array = resolveToArrayExpression(ctx, each.array);
	if (array === null) {
		return false;
	}
	for (const element of array.elements) {
		if (element === null || element.type === 'SpreadElement') {
			return false;
		}
		let bound = destructuredValue(ctx, each.context, element, binding);
		if (bound !== null && key !== undefined) {
			bound = accessKey(ctx, bound, key);
		}
		if (bound === null || !isValueAllowed(ctx, bound, resolveReferences, tsTools, config)) {
			return false;
		}
	}
	return true;
}

function memberValueIsAllowed(
	ctx: FindVariableContext,
	value: TSESTree.MemberExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	tsTools: TSTools | null,
	config: AllowedValueConfig
): boolean {
	const key = memberKey(value);
	if (key === null) {
		return false;
	}
	// Static access on an inline literal or nested expression: `[resolve('/')][0]`.
	if (value.object.type !== 'Identifier') {
		const target = accessKey(ctx, value.object, key);
		return target !== null && isValueAllowed(ctx, target, resolveReferences, tsTools, config);
	}
	const binding = resolveBindingIdentifier(ctx, value.object);
	if (binding === null) {
		return false;
	}
	// `item.url` where `item` is an `{#each}` iteration variable.
	if (eachItemValueIsAllowed(ctx, binding, key, resolveReferences, tsTools, config)) {
		return true;
	}
	// `paths[0]` where `paths` is a `const` array/object literal.
	if (binding.parent.type === 'VariableDeclarator' && binding.parent.init !== null) {
		const target = accessKey(ctx, binding.parent.init, key);
		return target !== null && isValueAllowed(ctx, target, resolveReferences, tsTools, config);
	}
	return false;
}

// Helper functions

function resolveBindingIdentifier(
	ctx: FindVariableContext,
	node: TSESTree.Identifier
): TSESTree.Identifier | null {
	const variable = ctx.findVariable(node);
	if (variable === null || variable.identifiers.length === 0) {
		return null;
	}
	return variable.identifiers[0];
}

/**
 * Resolve an `{#each array as context}` iteration variable to the iterated array and the
 * `context` destructuring pattern.
 */
function eachBlockOf(
	node: TSESTree.Node
): { array: TSESTree.Expression; context: TSESTree.Node } | null {
	const parent = node.parent as TSESTree.Node | AST.SvelteEachBlock | undefined;
	if (parent === undefined) {
		return null;
	}
	if (parent.type === 'SvelteEachBlock') {
		const context = parent.context;
		// Only the `as` context binds an element; reject the index/key identifiers.
		if (context === null || node !== context) {
			return null;
		}
		return { array: parent.expression, context };
	}
	if (parent.type === 'Property' && parent.parent.type === 'ObjectPattern') {
		return eachBlockOf(parent.parent);
	}
	if (parent.type === 'ArrayPattern') {
		return eachBlockOf(parent);
	}
	return null;
}

/**
 * Resolve the value that `binding` receives when the destructuring `pattern` is applied to
 * a concrete array `element`, descending one property/index at a time until it reaches
 * `binding`. Returns null if a step is not statically resolvable.
 */
function destructuredValue(
	ctx: FindVariableContext,
	pattern: TSESTree.Node,
	element: TSESTree.Expression,
	binding: TSESTree.Identifier
): TSESTree.Expression | null {
	if (pattern === binding) {
		return element;
	}
	if (pattern.type === 'ObjectPattern') {
		for (const property of pattern.properties) {
			if (property.type !== 'Property') {
				continue;
			}
			const key = propertyKey(property);
			const propertyValue = key === null ? null : resolveProperty(ctx, element, key);
			const result =
				propertyValue === null
					? null
					: destructuredValue(ctx, property.value, propertyValue, binding);
			if (result !== null) {
				return result;
			}
		}
		return null;
	}
	if (pattern.type === 'ArrayPattern') {
		for (const [index, subPattern] of pattern.elements.entries()) {
			const elementValue = subPattern === null ? null : resolveElement(ctx, element, index);
			const result =
				subPattern === null || elementValue === null
					? null
					: destructuredValue(ctx, subPattern, elementValue, binding);
			if (result !== null) {
				return result;
			}
		}
		return null;
	}
	return null;
}

/**
 * Resolve a single access — an array index or an object property — on an expression.
 */
function accessKey(
	ctx: FindVariableContext,
	expr: TSESTree.Expression,
	key: string | number
): TSESTree.Expression | null {
	return typeof key === 'number' ? resolveElement(ctx, expr, key) : resolveProperty(ctx, expr, key);
}

function resolveElement(
	ctx: FindVariableContext,
	arrayExpr: TSESTree.Expression,
	index: number
): TSESTree.Expression | null {
	const array = resolveToArrayExpression(ctx, arrayExpr);
	if (array === null) {
		return null;
	}
	const element = array.elements[index];
	if (element === null || element === undefined || element.type === 'SpreadElement') {
		return null;
	}
	return element;
}

function resolveProperty(
	ctx: FindVariableContext,
	objectExpr: TSESTree.Expression,
	key: string
): TSESTree.Expression | null {
	const object = resolveToObjectExpression(ctx, objectExpr);
	if (object === null) {
		return null;
	}
	for (const property of object.properties) {
		if (property.type === 'Property' && propertyKey(property) === key) {
			// `Property.value` is a shared type covering object patterns too, but in an object
			// literal a property value is always an expression.
			return property.value as TSESTree.Expression;
		}
	}
	return null;
}

function resolveToArrayExpression(
	ctx: FindVariableContext,
	node: TSESTree.Expression
): TSESTree.ArrayExpression | null {
	if (node.type === 'ArrayExpression') {
		return node;
	}
	const resolved = resolveToLiteralSource(ctx, node);
	return resolved === null ? null : resolveToArrayExpression(ctx, resolved);
}

function resolveToObjectExpression(
	ctx: FindVariableContext,
	node: TSESTree.Expression
): TSESTree.ObjectExpression | null {
	if (node.type === 'ObjectExpression') {
		return node;
	}
	const resolved = resolveToLiteralSource(ctx, node);
	return resolved === null ? null : resolveToObjectExpression(ctx, resolved);
}

function resolveToLiteralSource(
	ctx: FindVariableContext,
	node: TSESTree.Expression
): TSESTree.Expression | null {
	if (node.type === 'Identifier') {
		return resolveVariableInit(ctx, node);
	}
	if (node.type === 'MemberExpression') {
		const key = memberKey(node);
		return key === null ? null : accessKey(ctx, node.object, key);
	}
	return null;
}

function resolveVariableInit(
	ctx: FindVariableContext,
	node: TSESTree.Identifier
): TSESTree.Expression | null {
	const binding = resolveBindingIdentifier(ctx, node);
	if (binding === null || binding.parent.type !== 'VariableDeclarator') {
		return null;
	}
	return binding.parent.init;
}

function propertyKey(property: TSESTree.Property): string | null {
	if (property.computed) {
		return null;
	}
	if (property.key.type === 'Identifier') {
		return property.key.name;
	}
	if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
		return property.key.value;
	}
	return null;
}

function memberKey(member: TSESTree.MemberExpression): string | number | null {
	if (member.computed) {
		if (
			member.property.type === 'Literal' &&
			(typeof member.property.value === 'string' || typeof member.property.value === 'number')
		) {
			return member.property.value;
		}
		return null;
	}
	if (member.property.type === 'Identifier') {
		return member.property.name;
	}
	return null;
}

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
	const init = resolveVariableInit(ctx, node);
	if (init === null) {
		return false;
	}
	return expressionIsResolveCall(ctx, init, resolveReferences);
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

function expressionIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral
): boolean {
	switch (node.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsoluteUrl(ctx, node);
		case 'Literal':
			return typeof node.value === 'string' && valueIsAbsoluteUrl(node.value);
		case 'SvelteLiteral':
			return valueIsAbsoluteUrl(node.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsoluteUrl(ctx, node);
		default:
			return false;
	}
}

function binaryExpressionIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.BinaryExpression
): boolean {
	return (
		node.operator === '+' &&
		(expressionIsAbsoluteUrl(ctx, node.left) || expressionIsAbsoluteUrl(ctx, node.right))
	);
}

function templateLiteralIsAbsoluteUrl(
	ctx: FindVariableContext,
	node: TSESTree.TemplateLiteral
): boolean {
	return (
		node.expressions.some((expression) => expressionIsAbsoluteUrl(ctx, expression)) ||
		node.quasis.some((quasi) => valueIsAbsoluteUrl(quasi.value.raw))
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
	const init = resolveVariableInit(ctx, node);
	if (init === null) {
		return false;
	}
	return expressionStartsWith(ctx, init, prefix);
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
