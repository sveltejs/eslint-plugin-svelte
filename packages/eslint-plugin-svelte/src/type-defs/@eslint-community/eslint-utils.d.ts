import type {
	CALL,
	CONSTRUCT,
	ESM,
	READ,
	StaticValue,
	TraceMap,
	TrackedReferences,
	ReferenceTrackerOptions
} from '../../../node_modules/@eslint-community/eslint-utils/index.mjs';
import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from '@typescript-eslint/scope-manager';

declare module '@eslint-community/eslint-utils' {
	type Token = { type: string; value: string };
	export function isArrowToken(token: Token): boolean;
	export function isCommaToken(token: Token): boolean;
	export function isSemicolonToken(token: Token): boolean;
	export function isColonToken(token: Token): boolean;
	export function isOpeningParenToken(token: Token): boolean;
	export function isClosingParenToken(token: Token): boolean;
	export function isOpeningBracketToken(token: Token): boolean;
	export function isClosingBracketToken(token: Token): boolean;
	export function isOpeningBraceToken(token: Token): boolean;
	export function isClosingBraceToken(token: Token): boolean;
	export function isCommentToken(token: Token): token is AST.Comment;
	export function isNotArrowToken(token: Token): boolean;
	export function isNotCommaToken(token: Token): boolean;
	export function isNotSemicolonToken(token: Token): boolean;
	export function isNotColonToken(token: Token): boolean;
	export function isNotOpeningParenToken(token: Token): boolean;
	export function isNotClosingParenToken(token: Token): boolean;
	export function isNotOpeningBracketToken(token: Token): boolean;
	export function isNotClosingBracketToken(token: Token): boolean;
	export function isNotOpeningBraceToken(token: Token): boolean;
	export function isNotClosingBraceToken(token: Token): boolean;
	export function isNotCommentToken(token: Token): boolean;

	export function findVariable(
		initialScope: Scope,
		nameOrNode: TSESTree.Identifier | string
	): Scope.Variable;

	/**
	 * Get the property name from a MemberExpression node or a Property node.
	 */
	export function getPropertyName(
		node:
			| TSESTree.MemberExpression
			| TSESTree.MethodDefinition
			| TSESTree.Property
			| TSESTree.PropertyDefinition,
		initialScope?: Scope
	): string | null;

	/**
	 * Get the innermost scope which contains a given location.
	 */
	export function getInnermostScope(initialScope: Scope, node: TSESTree.Node): Scope;

	export class ReferenceTracker {
		public static readonly CALL: typeof CALL;

		public static readonly CONSTRUCT: typeof CONSTRUCT;

		public static readonly ESM: typeof ESM;

		public static readonly READ: typeof READ;

		public constructor(globalScope: Scope, options?: ReferenceTrackerOptions);

		/**
		 * Iterate the references of CommonJS modules.
		 */
		public iterateCjsReferences<T = unknown>(
			traceMap: TraceMap<T>
		): IterableIterator<TrackedReferences<T>>;

		/**
		 * Iterate the references of ES modules.
		 */
		public iterateEsmReferences<T = unknown>(
			traceMap: TraceMap<T>
		): IterableIterator<TrackedReferences<T>>;

		/**
		 * Iterate the references of global variables.
		 */
		public iterateGlobalReferences<T = unknown>(
			traceMap: TraceMap<T>
		): IterableIterator<TrackedReferences<T>>;

		/**
		 * Iterate the property references for a given expression AST node.
		 */
		public iteratePropertyReferences<T = unknown>(
			node: TSESTree.Expression,
			traceMap: TraceMap<T>
		): IterableIterator<TrackedReferences<T>>;
	}
	export function getStaticValue(
		node: TSESTree.Node,
		initialScope?: Scope | null | undefined
	): StaticValue | null;
}
