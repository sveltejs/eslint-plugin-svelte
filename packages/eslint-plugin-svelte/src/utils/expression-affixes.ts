import type { TSESTree } from '@typescript-eslint/types';
import { findVariable } from './ast-utils.js';
import type { RuleContext } from '../types.js';
import type { AST } from 'svelte-eslint-parser';
import { ASTSearchHelper } from './ast-search-helper.js';

// Variable prefix extraction

export function extractExpressionPrefixVariable(
	context: RuleContext,
	expression: TSESTree.Expression
): TSESTree.Identifier | null {
	switch (expression.type) {
		case 'BinaryExpression':
			return extractBinaryExpressionPrefixVariable(context, expression);
		case 'Identifier':
			return extractVariablePrefixVariable(context, expression);
		case 'MemberExpression':
			return extractMemberExpressionPrefixVariable(expression);
		case 'TemplateLiteral':
			return extractTemplateLiteralPrefixVariable(context, expression);
		default:
			return null;
	}
}

function extractBinaryExpressionPrefixVariable(
	context: RuleContext,
	expression: TSESTree.BinaryExpression
): TSESTree.Identifier | null {
	return expression.left.type !== 'PrivateIdentifier'
		? extractExpressionPrefixVariable(context, expression.left)
		: null;
}

function extractVariablePrefixVariable(
	context: RuleContext,
	expression: TSESTree.Identifier
): TSESTree.Identifier | null {
	const variable = findVariable(context, expression);
	if (
		variable === null ||
		variable.identifiers.length !== 1 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return expression;
	}
	return (
		extractExpressionPrefixVariable(context, variable.identifiers[0].parent.init) ?? expression
	);
}

function extractMemberExpressionPrefixVariable(
	expression: TSESTree.MemberExpression
): TSESTree.Identifier | null {
	return expression.property.type === 'Identifier' ? expression.property : null;
}

function extractTemplateLiteralPrefixVariable(
	context: RuleContext,
	expression: TSESTree.TemplateLiteral
): TSESTree.Identifier | null {
	const literalParts = [...expression.expressions, ...expression.quasis].sort((a, b) =>
		a.range[0] < b.range[0] ? -1 : 1
	);
	for (const part of literalParts) {
		if (part.type === 'TemplateElement' && part.value.raw === '') {
			// Skip empty quasi in the begining
			continue;
		}
		if (part.type !== 'TemplateElement') {
			return extractExpressionPrefixVariable(context, part);
		}
		return null;
	}
	return null;
}

export function extractExpressionPrefixLiteral(
	context: RuleContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	return ASTSearchHelper(expression, {
		BinaryExpression: (node, searchAnotherNode) =>
			node.left.type !== 'PrivateIdentifier' ? searchAnotherNode(node.left) : null,
		Identifier: (node, searchAnotherNode) => {
			const variable = findVariable(context, node);
			if (
				variable === null ||
				variable.identifiers.length !== 1 ||
				variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
				variable.identifiers[0].parent.init === null
			) {
				return null;
			}
			return searchAnotherNode(variable.identifiers[0].parent.init);
		},
		Literal: (node) => (typeof node.value === 'string' ? node.value : null),
		SvelteLiteral: (node) => node.value,
		TemplateLiteral: (node, searchAnotherNode) => {
			const literalParts = [...node.expressions, ...node.quasis].sort((a, b) =>
				a.range[0] < b.range[0] ? -1 : 1
			);
			for (const part of literalParts) {
				if (part.type === 'TemplateElement') {
					if (part.value.raw === '') {
						// Skip empty quasi
						continue;
					}
					return part.value.raw;
				}
				return searchAnotherNode(part);
			}
			return null;
		}
	});
}

export function extractExpressionSuffixLiteral(
	context: RuleContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	return ASTSearchHelper(expression, {
		BinaryExpression: (node, searchAnotherNode) => searchAnotherNode(node.right),
		Identifier: (node, searchAnotherNode) => {
			const variable = findVariable(context, node);
			if (
				variable === null ||
				variable.identifiers.length !== 1 ||
				variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
				variable.identifiers[0].parent.init === null
			) {
				return null;
			}
			return searchAnotherNode(variable.identifiers[0].parent.init);
		},
		Literal: (node) => (typeof node.value === 'string' ? node.value : null),
		SvelteLiteral: (node) => node.value,
		TemplateLiteral: (node, searchAnotherNode) => {
			const literalParts = [...node.expressions, ...node.quasis].sort((a, b) =>
				a.range[0] < b.range[0] ? -1 : 1
			);
			for (const part of literalParts.reverse()) {
				if (part.type === 'TemplateElement') {
					if (part.value.raw === '') {
						// Skip empty quasi
						continue;
					}
					return part.value.raw;
				}
				return searchAnotherNode(part);
			}
			return null;
		}
	});
}
