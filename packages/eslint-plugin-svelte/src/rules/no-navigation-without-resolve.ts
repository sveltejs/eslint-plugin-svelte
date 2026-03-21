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
			...(!ignoreLinks && {
				SvelteShorthandAttribute(node) {
					checkLinkAttribute(context, node, node.value, resolveReferences);
				},
				SvelteAttribute(node) {
					if (node.value.length > 0) {
						checkLinkAttribute(
							context,
							node,
							node.value[0].type === 'SvelteMustacheTag' ? node.value[0].expression : node.value[0],
							resolveReferences
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
	resolveReferences: Set<TSESTree.Identifier>
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(new FindVariableContext(context), call.arguments[0], resolveReferences, {})
	) {
		context.report({ loc: call.arguments[0].loc, messageId: 'gotoWithoutResolve' });
	}
}

function checkShallowNavigationCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	resolveReferences: Set<TSESTree.Identifier>,
	messageId: string
): void {
	if (
		call.arguments.length > 0 &&
		!isValueAllowed(new FindVariableContext(context), call.arguments[0], resolveReferences, {
			allowEmpty: true
		})
	) {
		context.report({ loc: call.arguments[0].loc, messageId });
	}
}

function checkLinkAttribute(
	context: RuleContext,
	attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute,
	value: TSESTree.Expression | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>
): void {
	if (
		attribute.parent.parent.type === 'SvelteElement' &&
		attribute.parent.parent.kind === 'html' &&
		attribute.parent.parent.name.type === 'SvelteName' &&
		attribute.parent.parent.name.name === 'a' &&
		attribute.key.name === 'href' &&
		!hasRelExternal(new FindVariableContext(context), attribute.parent) &&
		!isValueAllowed(new FindVariableContext(context), value, resolveReferences, {
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
	value: TSESTree.CallExpressionArgument | TSESTree.Expression | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>,
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
			variable.identifiers[0].parent.type === 'VariableDeclarator' &&
			variable.identifiers[0].parent.init !== null
		) {
			return isValueAllowed(ctx, variable.identifiers[0].parent.init, resolveReferences, config);
		}
	}
	if (
		(config.allowAbsolute && expressionIsAbsoluteUrl(value)) ||
		(config.allowEmpty && expressionIsEmpty(value)) ||
		(config.allowFragment && expressionStartsWith(value, '#')) ||
		(config.allowNullish && expressionIsNullish(value)) ||
		expressionIsResolveCall(value, resolveReferences)
	) {
		return true;
	}
	return false;
}

// Helper functions

function expressionIsResolveCall(
	node: TSESTree.CallExpressionArgument | AST.SvelteLiteral,
	resolveReferences: Set<TSESTree.Identifier>
): boolean {
	return (
		node.type === 'CallExpression' &&
		((node.callee.type === 'Identifier' && resolveReferences.has(node.callee)) ||
			(node.callee.type === 'MemberExpression' &&
				node.callee.property.type === 'Identifier' &&
				resolveReferences.has(node.callee.property)))
	);
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
		(node.left.type !== 'PrivateIdentifier' && expressionIsAbsoluteUrl(node.left)) ||
		expressionIsAbsoluteUrl(node.right)
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

function expressionStartsWith(
	node:
		| TSESTree.CallExpressionArgument
		| TSESTree.Expression
		| TSESTree.TemplateElement
		| AST.SvelteLiteral,
	prefix: string
): boolean {
	switch (node.type) {
		case 'BinaryExpression':
			return binaryExpressionStartsWith(node, prefix);
		case 'Literal':
			return typeof node.value === 'string' && node.value.startsWith(prefix);
		case 'SvelteLiteral':
			return node.value.startsWith(prefix);
		case 'TemplateElement':
			return node.value.raw.startsWith(prefix);
		case 'TemplateLiteral':
			return templateLiteralStartsWith(node, prefix);
		default:
			return false;
	}
}

function binaryExpressionStartsWith(node: TSESTree.BinaryExpression, prefix: string): boolean {
	return node.left.type !== 'PrivateIdentifier' && expressionStartsWith(node.left, prefix);
}

function templateLiteralStartsWith(node: TSESTree.TemplateLiteral, prefix: string): boolean {
	return (
		(node.expressions.length >= 1 && expressionStartsWith(node.expressions[0], prefix)) ||
		(node.quasis.length >= 1 && expressionStartsWith(node.quasis[0], prefix))
	);
}
