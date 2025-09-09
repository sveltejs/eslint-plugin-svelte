import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';

type ASTNode = AST.SvelteNode | TSESTree.Node;
type NodeResolvers<T> = {
	[K in ASTNode['type']]?: (
		node: ASTNode & { type: K },
		searchAnotherNode: (node: ASTNode) => T | null
	) => T | null;
};

export function ASTSearchHelper<T>(startNode: ASTNode, nodeResolvers: NodeResolvers<T>): T | null {
	const visitedNodes = new Set<ASTNode>();

	function searchNode(node: ASTNode): T | null {
		if (!(node.type in nodeResolvers) || visitedNodes.has(node)) {
			return null;
		}
		visitedNodes.add(node);
		return (
			nodeResolvers[node.type] as (
				node: ASTNode,
				searchAnotherNode: (node: ASTNode) => T | null
			) => T | null
		)(node, searchNode);
	}

	return searchNode(startNode);
}
