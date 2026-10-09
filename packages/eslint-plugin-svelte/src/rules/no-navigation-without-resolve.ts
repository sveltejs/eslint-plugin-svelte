import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';
import { getPropertyName, ReferenceTracker, getStaticValue } from '@eslint-community/eslint-utils';
import { FindVariableContext, getScope } from '../utils/ast-utils.js';
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
		!hasRelExternal(context, attribute.parent) &&
		!isValueAllowed(context, value, resolveReferences, tsTools, {
			allowAbsolute: true,
			allowNullish: true
		})
	) {
		context.report({ loc: attribute.loc, messageId: 'linkWithoutResolve' });
	}
}

function hasRelExternal(context: RuleContext, element: AST.SvelteStartTag): boolean {
	const relAttr = element.attributes.find(
		(attr): attr is AST.SvelteAttribute | AST.SvelteShorthandAttribute =>
			(attr.type === 'SvelteAttribute' || attr.type === 'SvelteShorthandAttribute') &&
			attr.key.name === 'rel'
	);
	if (relAttr === undefined) return false;

	function expressionValue(expression: TSESTree.Expression): string {
		const value = getStaticValue(expression, getScope(context, expression));
		if (typeof value?.value === 'string') return value.value;
		if (expression.type === 'TemplateLiteral') {
			return expression.quasis
				.map((quasi, index) => {
					const embedded = expression.expressions[index];
					return (
						(quasi.value.cooked ?? quasi.value.raw) +
						(embedded === undefined ? '' : expressionValue(embedded))
					);
				})
				.join('');
		}
		// An unknown value can extend an adjacent token, so it cannot be a token boundary.
		return '\0';
	}

	const value =
		relAttr.type === 'SvelteShorthandAttribute'
			? expressionValue(relAttr.value)
			: relAttr.value
					.map((part) =>
						part.type === 'SvelteLiteral' ? part.value : expressionValue(part.expression)
					)
					.join('');
	return value.split(/\s+/).includes('external');
}

interface AllowedValueConfig {
	allowAbsolute?: boolean;
	allowEmpty?: boolean;
	allowNullish?: boolean;
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
	config: AllowedValueConfig
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
	if (first.type === 'Identifier' || first.type === 'MemberExpression') {
		if (predicate(first, rest, visited)) {
			return true;
		}
		const expansion = expandReference(context, first, visited);
		if (expansion === null) {
			return false;
		}
		const expandedVisited =
			expansion.variable === null ? visited : new Set([...visited, expansion.variable]);
		return expansion.values.every((expanded) =>
			urlStartSatisfies(context, [expanded, ...rest], expandedVisited, predicate)
		);
	}
	return predicate(first, rest, visited);
}

// The values that a variable or a member access can stand for, e.g. the initializer of a variable, or each element of the array iterated by an `{#each}` block. All of them need to be allowed. Returns null if the reference cannot be statically resolved, or if its variable has already been expanded on the current path. `variable` is the variable that got expanded, if any.
function expandReference(
	context: RuleContext,
	reference: TSESTree.Identifier | TSESTree.MemberExpression,
	visited: ReadonlySet<Variable>
): { variable: Variable | null; values: TSESTree.Expression[] } | null {
	const ctx = new FindVariableContext(context);
	let key: string | undefined = undefined;
	let identifier: TSESTree.Identifier;
	if (reference.type === 'MemberExpression') {
		const propertyName = getPropertyName(reference, ctx.scopeFor(reference));
		if (propertyName === null) {
			return null;
		}
		// Static access on an inline literal or nested expression: `[resolve('/')][0]`.
		if (reference.object.type !== 'Identifier') {
			const target = accessKey(ctx, reference.object, propertyName);
			return target === null ? null : { variable: null, values: [target] };
		}
		key = propertyName;
		identifier = reference.object;
	} else {
		identifier = reference;
	}
	// `visited` is used instead of FindVariableContext, because the guard needs to be per path: the branches of a ternary share the parts following it, and each needs to expand their variables.
	const variable = findVariable(context, identifier);
	if (variable === null || visited.has(variable) || variable.identifiers.length === 0) {
		return null;
	}
	const binding = variable.identifiers[0];
	const values =
		binding.parent.type === 'VariableDeclarator'
			? binding.parent.init === null
				? null
				: [binding.parent.init]
			: eachItemValues(ctx, binding);
	if (values === null) {
		return null;
	}
	if (key === undefined) {
		return { variable, values };
	}
	const accessed: TSESTree.Expression[] = [];
	for (const value of values) {
		const target = accessKey(ctx, value, key);
		if (target === null) {
			return null;
		}
		accessed.push(target);
	}
	return { variable, values: accessed };
}

// The values that an `{#each}` iteration variable takes, one for each element of the iterated array, or null if they cannot be statically resolved.
function eachItemValues(
	ctx: FindVariableContext,
	binding: TSESTree.Identifier
): TSESTree.Expression[] | null {
	const each = eachBlockOf(binding);
	if (each === null) {
		return null;
	}
	const array = resolveToArrayExpression(ctx, each.array);
	if (array === null) {
		return null;
	}
	const values: TSESTree.Expression[] = [];
	for (const element of array.elements) {
		if (element === null || element.type === 'SpreadElement') {
			return null;
		}
		const value = destructuredValue(ctx, each.context, element, binding);
		if (value === null) {
			return null;
		}
		values.push(value);
	}
	return values;
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
			const key = getPropertyName(property, ctx.scopeFor(property));
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
	key: string
): TSESTree.Expression | null {
	const index = arrayIndex(key);
	return index === null ? resolveProperty(ctx, expr, key) : resolveElement(ctx, expr, index);
}

/**
 * The array index a property name refers to (e.g. `"0"`), or null if it is not a canonical
 * non-negative integer index.
 */
function arrayIndex(key: string): number | null {
	const index = Number(key);
	return Number.isInteger(index) && index >= 0 && String(index) === key ? index : null;
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
	const flattened = flattenElements(ctx, array, index);
	if (flattened === null) {
		return null;
	}
	return flattened[index] ?? null;
}

/**
 * Flatten an array literal's elements left to right, expanding each spread whose source is a
 * statically-resolvable array literal, until at least `index + 1` entries are known. Stops early
 * once the target index is covered, so a spread *after* it never forces a bail. Returns null if an
 * unresolvable (unknown-length) spread is reached at or before the target index.
 */
function flattenElements(
	ctx: FindVariableContext,
	array: TSESTree.ArrayExpression,
	index: number
): (TSESTree.Expression | null)[] | null {
	const flattened: (TSESTree.Expression | null)[] = [];
	for (const element of array.elements) {
		if (flattened.length > index) {
			break;
		}
		if (element === null) {
			flattened.push(null);
		} else if (element.type === 'SpreadElement') {
			const spread = resolveToArrayExpression(ctx, element.argument);
			if (spread === null) {
				return null;
			}
			const nested = flattenElements(ctx, spread, index - flattened.length);
			if (nested === null) {
				return null;
			}
			flattened.push(...nested);
		} else {
			flattened.push(element);
		}
	}
	return flattened;
}

function resolveProperty(
	ctx: FindVariableContext,
	objectExpr: TSESTree.Expression,
	key: string
): TSESTree.Expression | null {
	const lookup = lookupProperty(ctx, objectExpr, key);
	return lookup.type === 'found' ? lookup.value : null;
}

/**
 * The outcome of resolving a property `key` on an object literal: either the expression it is
 * definitely assigned (`found`), definitely not assigned (`absent`), or possibly assigned an
 * unknown value (`unknown`, e.g. an unresolvable spread or computed key). The three states are
 * needed to merge spreads soundly: `absent` keeps an earlier match, whereas `unknown` discards it.
 */
type PropertyLookup =
	| { type: 'found'; value: TSESTree.Expression }
	| { type: 'absent' }
	| { type: 'unknown' };

function lookupProperty(
	ctx: FindVariableContext,
	objectExpr: TSESTree.Expression,
	key: string
): PropertyLookup {
	const object = resolveToObjectExpression(ctx, objectExpr);
	if (object === null) {
		return { type: 'unknown' };
	}
	// Properties are resolved last-write-wins.
	let result: PropertyLookup = { type: 'absent' };
	for (const property of object.properties) {
		if (property.type === 'SpreadElement') {
			const spread = lookupProperty(ctx, property.argument, key);
			if (spread.type !== 'absent') {
				result = spread;
			}
		} else {
			const name = getPropertyName(property, ctx.scopeFor(property));
			if (name === null) {
				result = { type: 'unknown' };
			} else if (name === key) {
				result = { type: 'found', value: property.value as TSESTree.Expression };
			}
		}
	}
	return result;
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
		const key = getPropertyName(node, ctx.scopeFor(node));
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
