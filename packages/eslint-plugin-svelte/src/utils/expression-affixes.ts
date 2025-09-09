import type { TSESTree } from '@typescript-eslint/types';
import { findVariable } from './ast-utils.js';
import type { RuleContext } from '../types.js';
import type { AST } from 'svelte-eslint-parser';
import { ASTSearchHelper } from './ast-search-helper.js';

export function extractExpressionPrefixVariable(
	context: RuleContext,
	expression: TSESTree.Expression
): TSESTree.Identifier | null {
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
				return node;
			}
			return searchAnotherNode(variable.identifiers[0].parent.init) ?? node;
		},
		MemberExpression: (node) => (node.property.type === 'Identifier' ? node.property : null),
		TemplateLiteral: (node, searchAnotherNode) => {
			const literalParts = [...node.expressions, ...node.quasis].sort((a, b) =>
				a.range[0] < b.range[0] ? -1 : 1
			);
			for (const part of literalParts) {
				if (part.type === 'TemplateElement' && part.value.raw === '') {
					// Skip empty quasi in the begining
					continue;
				}
				if (part.type !== 'TemplateElement') {
					return searchAnotherNode(part);
				}
				return null;
			}
			return null;
		}
	});
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
