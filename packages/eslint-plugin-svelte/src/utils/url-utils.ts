import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';
import { ASTSearchHelper } from './ast-search-helper.js';

export function isAbsoluteURL(url: AST.SvelteLiteral | TSESTree.Expression): boolean {
	return (
		ASTSearchHelper(url, {
			BinaryExpression: (node, searchAnotherNode) =>
				(node.left.type !== 'PrivateIdentifier' && searchAnotherNode(node.left)) ||
				searchAnotherNode(node.right),
			Literal: (node) => typeof node.value === 'string' && urlValueIsAbsolute(node.value),
			SvelteLiteral: (node) => urlValueIsAbsolute(node.value),
			TemplateLiteral: (node, searchAnotherNode) =>
				node.expressions.some(searchAnotherNode) ||
				node.quasis.some((quasi) => urlValueIsAbsolute(quasi.value.raw))
		}) ?? false
	);
}

function urlValueIsAbsolute(url: string): boolean {
	return /^[+a-z]*:/i.test(url);
}

export function isFragmentURL(url: AST.SvelteLiteral | TSESTree.Expression): boolean {
	return (
		ASTSearchHelper(url, {
			BinaryExpression: (node, searchAnotherNode) =>
				node.left.type !== 'PrivateIdentifier' && searchAnotherNode(node.left),
			Literal: (node) => typeof node.value === 'string' && urlValueIsFragment(node.value),
			SvelteLiteral: (node) => urlValueIsFragment(node.value),
			TemplateLiteral: (node, searchAnotherNode) =>
				(node.expressions.length >= 1 && searchAnotherNode(node.expressions[0])) ||
				(node.quasis.length >= 1 && urlValueIsFragment(node.quasis[0].value.raw))
		}) ?? false
	);
}

function urlValueIsFragment(url: string): boolean {
	return url.startsWith('#');
}
