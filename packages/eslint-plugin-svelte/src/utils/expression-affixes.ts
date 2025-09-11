import type { TSESTree } from '@typescript-eslint/types';
import type { RuleContext } from '../types.js';
import type { AST } from 'svelte-eslint-parser';
import { FindVariableContext } from './ast-utils.js';

export function extractExpressionPrefixVariable(
	context: RuleContext,
	expression: TSESTree.Expression
): TSESTree.Identifier | null {
	return extractExpressionPrefixVariableInternal(new FindVariableContext(context), expression);
}

export function extractExpressionPrefixLiteral(
	context: RuleContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	return extractExpressionPrefixLiteralInternal(new FindVariableContext(context), expression);
}

export function extractExpressionSuffixLiteral(
	context: RuleContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	return extractExpressionSuffixLiteralInternal(new FindVariableContext(context), expression);
}

// Variable prefix extraction

function extractExpressionPrefixVariableInternal(
	context: FindVariableContext,
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
	context: FindVariableContext,
	expression: TSESTree.BinaryExpression
): TSESTree.Identifier | null {
	return expression.left.type !== 'PrivateIdentifier'
		? extractExpressionPrefixVariableInternal(context, expression.left)
		: null;
}

function extractVariablePrefixVariable(
	context: FindVariableContext,
	expression: TSESTree.Identifier
): TSESTree.Identifier | null {
	const variable = context.findVariable(expression);
	if (
		variable === null ||
		variable.identifiers.length !== 1 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return expression;
	}
	return (
		extractExpressionPrefixVariableInternal(context, variable.identifiers[0].parent.init) ??
		expression
	);
}

function extractMemberExpressionPrefixVariable(
	expression: TSESTree.MemberExpression
): TSESTree.Identifier | null {
	return expression.property.type === 'Identifier' ? expression.property : null;
}

function extractTemplateLiteralPrefixVariable(
	context: FindVariableContext,
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
			return extractExpressionPrefixVariableInternal(context, part);
		}
		return null;
	}
	return null;
}

// Literal prefix extraction

function extractExpressionPrefixLiteralInternal(
	context: FindVariableContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	switch (expression.type) {
		case 'BinaryExpression':
			return extractBinaryExpressionPrefixLiteral(context, expression);
		case 'Identifier':
			return extractVariablePrefixLiteral(context, expression);
		case 'Literal':
			return typeof expression.value === 'string' ? expression.value : null;
		case 'SvelteLiteral':
			return expression.value;
		case 'TemplateLiteral':
			return extractTemplateLiteralPrefixLiteral(context, expression);
		default:
			return null;
	}
}

function extractBinaryExpressionPrefixLiteral(
	context: FindVariableContext,
	expression: TSESTree.BinaryExpression
): string | null {
	return expression.left.type !== 'PrivateIdentifier'
		? extractExpressionPrefixLiteralInternal(context, expression.left)
		: null;
}

function extractVariablePrefixLiteral(
	context: FindVariableContext,
	expression: TSESTree.Identifier
): string | null {
	const variable = context.findVariable(expression);
	if (
		variable === null ||
		variable.identifiers.length !== 1 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return null;
	}
	return extractExpressionPrefixLiteralInternal(context, variable.identifiers[0].parent.init);
}

function extractTemplateLiteralPrefixLiteral(
	context: FindVariableContext,
	expression: TSESTree.TemplateLiteral
): string | null {
	const literalParts = [...expression.expressions, ...expression.quasis].sort((a, b) =>
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
		return extractExpressionPrefixLiteralInternal(context, part);
	}
	return null;
}

// Literal suffix extraction

function extractExpressionSuffixLiteralInternal(
	context: FindVariableContext,
	expression: AST.SvelteLiteral | TSESTree.Node
): string | null {
	switch (expression.type) {
		case 'BinaryExpression':
			return extractBinaryExpressionSuffixLiteral(context, expression);
		case 'Identifier':
			return extractVariableSuffixLiteral(context, expression);
		case 'Literal':
			return typeof expression.value === 'string' ? expression.value : null;
		case 'SvelteLiteral':
			return expression.value;
		case 'TemplateLiteral':
			return extractTemplateLiteralSuffixLiteral(context, expression);
		default:
			return null;
	}
}

function extractBinaryExpressionSuffixLiteral(
	context: FindVariableContext,
	expression: TSESTree.BinaryExpression
): string | null {
	return extractExpressionSuffixLiteralInternal(context, expression.right);
}

function extractVariableSuffixLiteral(
	context: FindVariableContext,
	expression: TSESTree.Identifier
): string | null {
	const variable = context.findVariable(expression);
	if (
		variable === null ||
		variable.identifiers.length !== 1 ||
		variable.identifiers[0].parent.type !== 'VariableDeclarator' ||
		variable.identifiers[0].parent.init === null
	) {
		return null;
	}
	return extractExpressionSuffixLiteralInternal(context, variable.identifiers[0].parent.init);
}

function extractTemplateLiteralSuffixLiteral(
	context: FindVariableContext,
	expression: TSESTree.TemplateLiteral
): string | null {
	const literalParts = [...expression.expressions, ...expression.quasis].sort((a, b) =>
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
		return extractExpressionSuffixLiteralInternal(context, part);
	}
	return null;
}
