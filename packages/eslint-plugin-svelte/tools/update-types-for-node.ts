import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { parseForESLint } from 'svelte-eslint-parser';
import path from 'path';
import { writeAndFormat } from './lib/write.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// import { fileURLToPath } from "url"
// const filename = fileURLToPath(import.meta.url)
const dirname = __dirname; // path.dirname(filename)
const typesForNodeFilename = path.join(dirname, '../src/types-for-node.ts');
const estreeFilename = path.join(dirname, '../src/type-defs/estree.d.ts');
const { visitorKeys } = parseForESLint('');

const esNextNodeNames = ['Decorator', 'ImportAttribute', 'StaticBlock'];
const esSvelteNodeNames = ['Program', 'SvelteReactiveStatement'];
const tsEsNodeNames = Object.keys(AST_NODE_TYPES).filter((k) => k !== 'Program');
const esNodeNames = tsEsNodeNames.filter(
	(k) => !k.startsWith('TS') && !k.startsWith('JSX') && !esNextNodeNames.includes(k)
);
const tsNodeNames = tsEsNodeNames.filter((k) => !k.startsWith('JSX') && !esNodeNames.includes(k));
const svelteNodeNames = Object.keys(visitorKeys).filter(
	(k) => !tsEsNodeNames.includes(k) && !k.startsWith('Experimental')
);

const estreeCode = [
	`/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
//
// Replace type information to use "@typescript-eslint/types" instead of "estree".
//
declare module 'estree' {
import type { TSESTree } from "@typescript-eslint/types"

export type Node = TSESTree.Node
export type Program = TSESTree.Program
export type Expression = TSESTree.Expression
export type Statement = TSESTree.Statement
export type Pattern = TSESTree.DestructuringPattern`
];
const typesForNodeCode = [
	`/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
//
// The information here can be calculated by calculating the type,
// but is pre-defined to avoid the computational cost.
//

import type { TSESTree, AST_NODE_TYPES } from "@typescript-eslint/types";
import type { AST } from "svelte-eslint-parser"

export type ASTNode =
  | AST.SvelteNode
  | Exclude<Omit<TSESTree.Node, "parent">, { type: AST.SvelteNode["type"] }>
export type ASTNodeWithParent =
  | (Exclude<ASTNode, AST.SvelteProgram> & { parent: ASTNodeWithParent })
  | AST.SvelteProgram

export type ASTNodeListener = {`
];
for (const nodeType of tsEsNodeNames) {
	let argType = `TSESTree.${nodeType}`;
	if (nodeType === 'TSIntrinsicKeyword') {
		argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`;
	}
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
}
for (const nodeType of svelteNodeNames) {
	let argType = `AST.${nodeType}`;
	if (nodeType === 'Program') {
		argType = `AST.SvelteProgram`;
	}
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
}
typesForNodeCode.push(`}`);
typesForNodeCode.push(``);
typesForNodeCode.push(`export type ESNodeListener = {`);
for (const nodeType of esNodeNames) {
	const argType = `TSESTree.${nodeType}`;
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
	estreeCode.push(`export type ${nodeType} = TSESTree.${nodeType}`);
}
for (const nodeType of esSvelteNodeNames) {
	let argType = `AST.${nodeType}`;
	if (nodeType === 'Program') {
		argType = `AST.SvelteProgram`;
	}
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
}
typesForNodeCode.push(`}`);
typesForNodeCode.push(``);
typesForNodeCode.push(`export type TSNodeListener = {`);
for (const nodeType of tsNodeNames) {
	let argType = `TSESTree.${nodeType}`;
	if (nodeType === 'TSIntrinsicKeyword') {
		argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`;
	}
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
}
typesForNodeCode.push(`}`);
typesForNodeCode.push(``);
typesForNodeCode.push(`export type SvelteNodeListener = {`);
for (const nodeType of svelteNodeNames.filter((k) => !esSvelteNodeNames.includes(k))) {
	const argType = `AST.${nodeType}`;
	typesForNodeCode.push(`  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void`);
}
typesForNodeCode.push(`}`);

estreeCode.push(`}`);
void writeAndFormat(typesForNodeFilename, typesForNodeCode.join('\n'));
void writeAndFormat(estreeFilename, estreeCode.join('\n'));
