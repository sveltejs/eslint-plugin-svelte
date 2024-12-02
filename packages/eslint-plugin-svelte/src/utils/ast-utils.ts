import type { ASTNode, RuleContext, SourceCode } from '../types.js';
import type { TSESTree } from '@typescript-eslint/types';
import type { Scope, Variable } from '@typescript-eslint/scope-manager';
import type { AST as SvAST } from 'svelte-eslint-parser';
import * as eslintUtils from '@eslint-community/eslint-utils';
import { voidElements, svgElements, mathmlElements } from './element-types.js';
import { getSourceCode } from './compat.js';

/**
 * Checks whether or not the tokens of two given nodes are same.
 * @param left A node 1 to compare.
 * @param right A node 2 to compare.
 * @param sourceCode The ESLint source code object.
 * @returns  the source code for the given node.
 */
export function equalTokens(left: ASTNode, right: ASTNode, sourceCode: SourceCode): boolean {
	const tokensL = sourceCode.getTokens(left);
	const tokensR = sourceCode.getTokens(right);

	if (tokensL.length !== tokensR.length) {
		return false;
	}
	for (let i = 0; i < tokensL.length; ++i) {
		if (tokensL[i].type !== tokensR[i].type || tokensL[i].value !== tokensR[i].value) {
			return false;
		}
	}

	return true;
}

/**
 * Get the value of a given node if it's a literal or a template literal.
 */
export function getStringIfConstant(
	node: TSESTree.Expression | TSESTree.PrivateIdentifier
): string | null {
	if (node.type === 'Literal') {
		if (typeof node.value === 'string') return node.value;
	} else if (node.type === 'TemplateLiteral') {
		let str = '';
		const quasis = [...node.quasis];
		const expressions = [...node.expressions];
		let quasi: TSESTree.TemplateElement | undefined, expr: TSESTree.Expression | undefined;
		while ((quasi = quasis.shift())) {
			str += quasi.value.cooked;
			expr = expressions.shift();
			if (expr) {
				const exprStr = getStringIfConstant(expr);
				if (exprStr == null) {
					return null;
				}
				str += exprStr;
			}
		}
		return str;
	} else if (node.type === 'BinaryExpression') {
		if (node.operator === '+') {
			const left = getStringIfConstant(node.left);
			if (left == null) {
				return null;
			}
			const right = getStringIfConstant(node.right);
			if (right == null) {
				return null;
			}
			return left + right;
		}
	}
	return null;
}

/**
 * Check if it need parentheses.
 */
export function needParentheses(node: TSESTree.Expression, kind: 'not' | 'logical'): boolean {
	if (
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'AssignmentExpression' ||
		node.type === 'BinaryExpression' ||
		node.type === 'ConditionalExpression' ||
		node.type === 'LogicalExpression' ||
		node.type === 'SequenceExpression' ||
		node.type === 'UnaryExpression' ||
		node.type === 'UpdateExpression'
	)
		return true;
	if (kind === 'logical') {
		return node.type === 'FunctionExpression';
	}
	return false;
}

/** Checks whether the given node is the html element node or <svelte:element> node. */
export function isHTMLElementLike(
	node: SvAST.SvelteElement | SvAST.SvelteScriptElement | SvAST.SvelteStyleElement
): node is
	| SvAST.SvelteHTMLElement
	| (SvAST.SvelteSpecialElement & {
			name: SvAST.SvelteName & { name: 'svelte:element' };
	  }) {
	if (node.type !== 'SvelteElement') {
		return false;
	}

	switch (node.kind) {
		case 'html':
			return true;
		case 'special':
			return node.name.name === 'svelte:element';
		default:
			return false;
	}
}

/**
 * Find the attribute from the given element node
 */
export function findAttribute<N extends string>(
	node:
		| SvAST.SvelteElement
		| SvAST.SvelteScriptElement
		| SvAST.SvelteStyleElement
		| SvAST.SvelteStartTag,
	name: N
):
	| (SvAST.SvelteAttribute & {
			key: SvAST.SvelteAttribute['key'] & { name: N };
	  })
	| null {
	const startTag = node.type === 'SvelteStartTag' ? node : node.startTag;
	for (const attr of startTag.attributes) {
		if (attr.type === 'SvelteAttribute') {
			if (attr.key.name === name) {
				return attr as never;
			}
		}
	}
	return null;
}
/**
 * Find the shorthand attribute from the given element node
 */
export function findShorthandAttribute<N extends string>(
	node:
		| SvAST.SvelteElement
		| SvAST.SvelteScriptElement
		| SvAST.SvelteStyleElement
		| SvAST.SvelteStartTag,
	name: N
):
	| (SvAST.SvelteShorthandAttribute & {
			key: SvAST.SvelteShorthandAttribute['key'] & { name: N };
	  })
	| null {
	const startTag = node.type === 'SvelteStartTag' ? node : node.startTag;
	for (const attr of startTag.attributes) {
		if (attr.type === 'SvelteShorthandAttribute') {
			if (attr.key.name === name) {
				return attr as never;
			}
		}
	}
	return null;
}

/**
 * Find the bind directive from the given element node
 */
export function findBindDirective<N extends string>(
	node:
		| SvAST.SvelteElement
		| SvAST.SvelteScriptElement
		| SvAST.SvelteStyleElement
		| SvAST.SvelteStartTag,
	name: N
):
	| (SvAST.SvelteBindingDirective & {
			key: SvAST.SvelteDirectiveKey & {
				name: SvAST.SvelteDirectiveKey['name'] & { name: N };
			};
	  })
	| null {
	const startTag = node.type === 'SvelteStartTag' ? node : node.startTag;
	for (const attr of startTag.attributes) {
		if (attr.type === 'SvelteDirective') {
			if (attr.kind === 'Binding' && attr.key.name.name === name) {
				return attr as never;
			}
		}
	}
	return null;
}

/**
 * Get the static attribute value from given attribute
 */
export function getStaticAttributeValue(node: SvAST.SvelteAttribute): string | null {
	let str = '';
	for (const value of node.value) {
		if (value.type === 'SvelteLiteral') {
			str += value.value;
		} else {
			return null;
		}
	}
	return str;
}
/**
 * Get the static attribute value from given attribute
 */
export function getLangValue(
	node: SvAST.SvelteScriptElement | SvAST.SvelteStyleElement
): string | null {
	const langAttr = findAttribute(node, 'lang');
	return langAttr && getStaticAttributeValue(langAttr);
}

/**
 * Find the variable of a given name.
 */
export function findVariable(context: RuleContext, node: TSESTree.Identifier): Variable | null {
	const initialScope = eslintUtils.getInnermostScope(getScope(context, node), node);
	const variable = eslintUtils.findVariable(initialScope, node);
	if (variable) {
		return variable;
	}
	if (!node.name.startsWith('$')) {
		return variable;
	}
	// Remove the $ and search for the variable again, as it may be a store access variable.
	return eslintUtils.findVariable(initialScope, node.name.slice(1));
}
/**
 * Iterate the identifiers of a given pattern node.
 */
export function* iterateIdentifiers(
	node: TSESTree.DestructuringPattern
): Iterable<TSESTree.Identifier> {
	const buffer = [node];
	let pattern: TSESTree.DestructuringPattern | undefined;
	while ((pattern = buffer.shift())) {
		if (pattern.type === 'Identifier') {
			yield pattern;
		} else if (pattern.type === 'ArrayPattern') {
			for (const element of pattern.elements) {
				if (element) {
					buffer.push(element);
				}
			}
		} else if (pattern.type === 'ObjectPattern') {
			for (const property of pattern.properties) {
				if (property.type === 'Property') {
					buffer.push(property.value as TSESTree.DestructuringPattern);
				} else if (property.type === 'RestElement') {
					buffer.push(property);
				}
			}
		} else if (pattern.type === 'AssignmentPattern') {
			buffer.push(pattern.left);
		} else if (pattern.type === 'RestElement') {
			buffer.push(pattern.argument);
		} else if (pattern.type === 'MemberExpression') {
			// noop
		}
	}
}

/**
 * Gets the scope for the current node
 */
export function getScope(context: RuleContext, currentNode: TSESTree.Node): Scope {
	const scopeManager = getSourceCode(context).scopeManager;

	let node: TSESTree.Node | null = currentNode;
	for (; node; node = node.parent || null) {
		const scope = scopeManager.acquire(node, false);

		if (scope) {
			if (scope.type === 'function-expression-name') {
				return scope.childScopes[0];
			}
			return scope;
		}
	}

	return scopeManager.scopes[0];
}

/** Get the parent node from the given node */
export function getParent(node: TSESTree.Node): TSESTree.Node | null {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
	return (node as any).parent || null;
}

export type QuoteAndRange = {
	quote: 'unquoted' | 'double' | 'single';
	range: [number, number];
	firstToken: SvAST.Token | SvAST.Comment;
	lastToken: SvAST.Token | SvAST.Comment;
};
/** Get the quote and range from given attribute values */
export function getAttributeValueQuoteAndRange(
	attr:
		| SvAST.SvelteAttribute
		| SvAST.SvelteDirective
		| SvAST.SvelteStyleDirective
		| SvAST.SvelteSpecialDirective,
	sourceCode: SourceCode
): QuoteAndRange | null {
	const valueTokens = getAttributeValueRangeTokens(attr, sourceCode);
	if (valueTokens == null) {
		return null;
	}
	const { firstToken: valueFirstToken, lastToken: valueLastToken } = valueTokens;
	const eqToken = sourceCode.getTokenAfter(attr.key);
	if (!eqToken || eqToken.value !== '=' || valueFirstToken.range[0] < eqToken.range[1]) {
		// invalid
		return null;
	}
	const beforeTokens = sourceCode.getTokensBetween(eqToken, valueFirstToken);
	if (beforeTokens.length === 0) {
		return {
			quote: 'unquoted',
			range: [valueFirstToken.range[0], valueLastToken.range[1]],
			firstToken: valueFirstToken,
			lastToken: valueLastToken
		};
	} else if (
		beforeTokens.length > 1 ||
		(beforeTokens[0].value !== '"' && beforeTokens[0].value !== "'")
	) {
		// invalid
		return null;
	}
	const beforeToken = beforeTokens[0];
	const afterToken = sourceCode.getTokenAfter(valueLastToken);
	if (!afterToken || afterToken.value !== beforeToken.value) {
		// invalid
		return null;
	}

	return {
		quote: beforeToken.value === '"' ? 'double' : 'single',
		range: [beforeToken.range[0], afterToken.range[1]],
		firstToken: beforeToken,
		lastToken: afterToken
	};
}
export function getMustacheTokens(
	node:
		| SvAST.SvelteMustacheTag
		| SvAST.SvelteShorthandAttribute
		| SvAST.SvelteSpreadAttribute
		| SvAST.SvelteDebugTag
		| SvAST.SvelteRenderTag,
	sourceCode: SourceCode
): {
	openToken: SvAST.Token;
	closeToken: SvAST.Token;
};
export function getMustacheTokens(
	node:
		| SvAST.SvelteDirective
		| SvAST.SvelteSpecialDirective
		| SvAST.SvelteMustacheTag
		| SvAST.SvelteShorthandAttribute
		| SvAST.SvelteSpreadAttribute
		| SvAST.SvelteDebugTag
		| SvAST.SvelteRenderTag,
	sourceCode: SourceCode
): {
	openToken: SvAST.Token;
	closeToken: SvAST.Token;
} | null;
/** Get the mustache tokens from given node */
export function getMustacheTokens(
	node:
		| SvAST.SvelteDirective
		| SvAST.SvelteSpecialDirective
		| SvAST.SvelteMustacheTag
		| SvAST.SvelteShorthandAttribute
		| SvAST.SvelteSpreadAttribute
		| SvAST.SvelteDebugTag
		| SvAST.SvelteRenderTag,
	sourceCode: SourceCode
): {
	openToken: SvAST.Token;
	closeToken: SvAST.Token;
} | null {
	if (isWrappedInBraces(node)) {
		const openToken = sourceCode.getFirstToken(node);
		const closeToken = sourceCode.getLastToken(node);
		return {
			openToken,
			closeToken
		};
	}
	if (node.expression == null) {
		return null;
	}
	if (
		node.key.range[0] <= node.expression.range[0] &&
		node.expression.range[1] <= node.key.range[1]
	) {
		// shorthand
		return null;
	}
	let openToken = sourceCode.getTokenBefore(node.expression);
	let closeToken = sourceCode.getTokenAfter(node.expression);
	while (
		openToken &&
		closeToken &&
		eslintUtils.isOpeningParenToken(openToken) &&
		eslintUtils.isClosingParenToken(closeToken)
	) {
		openToken = sourceCode.getTokenBefore(openToken);
		closeToken = sourceCode.getTokenAfter(closeToken);
	}
	if (
		!openToken ||
		!closeToken ||
		eslintUtils.isNotOpeningBraceToken(openToken) ||
		eslintUtils.isNotClosingBraceToken(closeToken)
	) {
		return null;
	}
	return {
		openToken,
		closeToken
	};
}

function isWrappedInBraces(
	node:
		| SvAST.SvelteDirective
		| SvAST.SvelteSpecialDirective
		| SvAST.SvelteMustacheTag
		| SvAST.SvelteShorthandAttribute
		| SvAST.SvelteSpreadAttribute
		| SvAST.SvelteDebugTag
		| SvAST.SvelteRenderTag
): node is
	| SvAST.SvelteMustacheTag
	| SvAST.SvelteShorthandAttribute
	| SvAST.SvelteSpreadAttribute
	| SvAST.SvelteDebugTag
	| SvAST.SvelteRenderTag {
	return (
		node.type === 'SvelteMustacheTag' ||
		node.type === 'SvelteShorthandAttribute' ||
		node.type === 'SvelteSpreadAttribute' ||
		node.type === 'SvelteDebugTag' ||
		node.type === 'SvelteRenderTag'
	);
}

/** Get attribute key text */
export function getAttributeKeyText(
	node:
		| SvAST.SvelteAttribute
		| SvAST.SvelteShorthandAttribute
		| SvAST.SvelteStyleDirective
		| SvAST.SvelteDirective
		| SvAST.SvelteSpecialDirective
		| SvAST.SvelteGenericsDirective,
	context: RuleContext
): string {
	switch (node.type) {
		case 'SvelteAttribute':
		case 'SvelteShorthandAttribute':
		case 'SvelteGenericsDirective':
			return node.key.name;
		case 'SvelteStyleDirective':
			return `style:${node.key.name.name}`;
		case 'SvelteSpecialDirective':
			return node.kind;
		case 'SvelteDirective': {
			const dir = getDirectiveName(node);
			return `${dir}:${getSimpleNameFromNode(node.key.name, context)}${
				node.key.modifiers.length ? `|${node.key.modifiers.join('|')}` : ''
			}`;
		}
		default:
			throw new Error(
				`Unknown node type: ${
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- error
					(node as any).type
				}`
			);
	}
}

/** Get directive name */
export function getDirectiveName(node: SvAST.SvelteDirective): string {
	switch (node.kind) {
		case 'Action':
			return 'use';
		case 'Animation':
			return 'animate';
		case 'Binding':
			return 'bind';
		case 'Class':
			return 'class';
		case 'EventHandler':
			return 'on';
		case 'Let':
			return 'let';
		case 'Transition':
			return node.intro && node.outro ? 'transition' : node.intro ? 'in' : 'out';
		case 'Ref':
			return 'ref';
		default:
			throw new Error('Unknown directive kind');
	}
}

/** Get the value tokens from given attribute */
function getAttributeValueRangeTokens(
	attr:
		| SvAST.SvelteAttribute
		| SvAST.SvelteDirective
		| SvAST.SvelteStyleDirective
		| SvAST.SvelteSpecialDirective,
	sourceCode: SourceCode
) {
	if (attr.type === 'SvelteAttribute' || attr.type === 'SvelteStyleDirective') {
		if (!attr.value.length) {
			return null;
		}
		const first = attr.value[0];
		const last = attr.value[attr.value.length - 1];
		return {
			firstToken: sourceCode.getFirstToken(first),
			lastToken: sourceCode.getLastToken(last)
		};
	}
	const tokens = getMustacheTokens(attr, sourceCode);
	if (!tokens) {
		return null;
	}
	return {
		firstToken: tokens.openToken,
		lastToken: tokens.closeToken
	};
}

/**
 * Returns name of SvelteElement
 */
export function getNodeName(node: SvAST.SvelteElement): string {
	return getSimpleNameFromNode(node.name);
}

/**
 * Returns true if element is known void element
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Empty_element}
 */
export function isVoidHtmlElement(node: SvAST.SvelteElement): boolean {
	return voidElements.includes(getNodeName(node));
}

/**
 * Returns true if element is known foreign (SVG or MathML) element
 */
export function isForeignElement(node: SvAST.SvelteElement): boolean {
	return svgElements.includes(getNodeName(node)) || mathmlElements.includes(getNodeName(node));
}

/** Checks whether the given identifier node is used as an expression. */
export function isExpressionIdentifier(node: TSESTree.Identifier): boolean {
	const parent = node.parent;
	if (!parent) {
		return true;
	}
	if (parent.type === 'MemberExpression') {
		return !parent.computed || parent.property !== node;
	}
	if (
		parent.type === 'Property' ||
		parent.type === 'MethodDefinition' ||
		parent.type === 'PropertyDefinition'
	) {
		return !parent.computed || parent.key !== node;
	}
	if (
		parent.type === 'FunctionDeclaration' ||
		parent.type === 'FunctionExpression' ||
		parent.type === 'ClassDeclaration' ||
		parent.type === 'ClassExpression'
	) {
		return parent.id !== node;
	}
	if (
		parent.type === 'LabeledStatement' ||
		parent.type === 'BreakStatement' ||
		parent.type === 'ContinueStatement'
	) {
		return parent.label !== node;
	}
	if (parent.type === 'MetaProperty') {
		return parent.property !== node;
	}
	if (parent.type === 'ImportSpecifier') {
		return parent.imported !== node;
	}
	if (parent.type === 'ExportSpecifier') {
		return parent.exported !== node;
	}

	return true;
}

function getSimpleNameFromNode(
	node: SvAST.SvelteName | SvAST.SvelteMemberExpressionName | TSESTree.Identifier,
	context?: RuleContext
): string;
function getSimpleNameFromNode(
	node:
		| SvAST.SvelteName
		| SvAST.SvelteMemberExpressionName
		| TSESTree.PrivateIdentifier
		| TSESTree.Expression,
	context: RuleContext
): string;
/** Get simple name from give node */
function getSimpleNameFromNode(
	node:
		| SvAST.SvelteName
		| SvAST.SvelteMemberExpressionName
		| TSESTree.PrivateIdentifier
		| TSESTree.Expression,
	context: RuleContext | undefined
): string {
	if (node.type === 'Identifier' || node.type === 'SvelteName') {
		return node.name;
	}
	if (
		node.type === 'SvelteMemberExpressionName' ||
		(node.type === 'MemberExpression' && !node.computed)
	) {
		return `${getSimpleNameFromNode(node.object, context!)}.${getSimpleNameFromNode(
			node.property,
			context!
		)}`;
	}

	// No nodes other than those listed above are currently expected to be used in names.

	if (!context) {
		throw new Error('Rule context is required');
	}

	return getSourceCode(context).getText(node);
}
