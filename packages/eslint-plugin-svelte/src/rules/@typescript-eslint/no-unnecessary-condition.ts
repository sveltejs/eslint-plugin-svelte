// This rule is based on typescript-eslint's no-unnecessary-condition rule
// and modified to work well with Svelte components.
// https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-unnecessary-condition.ts
import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../../utils/index.js';
import {
	isFalsyType,
	getConstrainedTypeAtLocation,
	isTruthyLiteral,
	isPossiblyFalsyType,
	isNullishType,
	isBooleanLiteralType,
	getTypeScriptTools,
	isAnyType,
	isUnknownType,
	isNeverType,
	getCallSignaturesOfType,
	isNullableType,
	getTypeOfPropertyOfType,
	getTypeName,
	isTupleType
} from '../../utils/ts-utils/index.js';
import type { TS, TSTools } from '../../utils/ts-utils/index.js';
import { getSourceCode } from '../../utils/compat.js';

/**
 * Returns all types of a union type or an array containing `type` itself if it's no union type.
 * This method is heavily inspired by tsutils. https://github.com/ajafff/tsutils
 * The MIT License (MIT) Copyright (c) 2017 Klaus Meinhardt
 * https://github.com/ajafff/tsutils/blob/master/LICENSE
 */
function unionTypeParts(type: TS.Type): TS.Type[] {
	return [...iterate(type)];

	/**
	 * iterate
	 */
	function* iterate(t: TS.Type): Iterable<TS.Type> {
		if (t.isUnion()) {
			for (const type of t.types) {
				yield* iterate(type);
			}
		} else {
			yield t;
		}
	}
}

/**
 * Check whether the given type can be a falsy type or not.
 */
function isPossiblyFalsy(type: TS.Type, tsTools: TSTools): boolean {
	return (
		unionTypeParts(type)
			// PossiblyFalsy flag includes literal values, so exclude ones that
			// are definitely truthy
			.filter((t) => !isTruthyLiteral(t, tsTools))
			.some((type) => isPossiblyFalsyType(type, tsTools.ts))
	);
}

/**
 * Check whether the given type can be a truthy type or not.
 */
function isPossiblyTruthy(type: TS.Type, tsTools: TSTools): boolean {
	return unionTypeParts(type).some((type) => !isFalsyType(type, tsTools));
}

/**
 * Check whether the given type can be a nullish type or not.
 */
function isPossiblyNullish(type: TS.Type, tsTools: TSTools): boolean {
	return isNullableType(type, tsTools.ts);
}

/**
 * Check whether the given type is a nullish type or not.
 */
function isAlwaysNullish(type: TS.Type, tsTools: TSTools): boolean {
	return isNullishType(type, tsTools.ts);
}

/**
 * Check whether the given type is a literal type or not.
 */
function isLiteral(type: TS.Type, tsTools: TSTools): boolean {
	return (
		isBooleanLiteralType(type, tsTools.ts) || isNullishType(type, tsTools.ts) || type.isLiteral()
	);
}

export default createRule('@typescript-eslint/no-unnecessary-condition', {
	meta: {
		docs: {
			description: 'disallow conditionals where the type is always truthy or always falsy',
			category: 'Extension Rules',
			recommended: false,
			extensionRule: {
				plugin: '@typescript-eslint/eslint-plugin',
				url: 'https://typescript-eslint.io/rules/no-unnecessary-condition/'
			}
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowConstantLoopConditions: {
						description: 'Whether to ignore constant loop conditions, such as `while (true)`.',
						type: 'boolean'
					},
					allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
						description:
							'Whether to not error when running with a tsconfig that has strictNullChecks turned.',
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		fixable: 'code',
		messages: {
			alwaysTruthy: 'Unnecessary conditional, value is always truthy.',
			alwaysFalsy: 'Unnecessary conditional, value is always falsy.',
			alwaysTruthyFunc: 'This callback should return a conditional, but return is always truthy.',
			alwaysFalsyFunc: 'This callback should return a conditional, but return is always falsy.',
			neverNullish:
				'Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined.',
			alwaysNullish:
				'Unnecessary conditional, left-hand side of `??` operator is always `null` or `undefined`.',
			literalBooleanExpression:
				'Unnecessary conditional, both sides of the expression are literal values.',
			noOverlapBooleanExpression: 'Unnecessary conditional, the types have no overlap.',
			never: 'Unnecessary conditional, value is `never`.',
			neverOptionalChain: 'Unnecessary optional chain on a non-nullish value.',
			noStrictNullCheck:
				'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.'
		},
		type: 'suggestion', // "problem", or "layout",
		deprecated: true,
		replacedBy: {
			note: 'This rule is no longer needed when using svelte-eslint-parser>=v0.19.0.'
		}
	},
	create(context) {
		const {
			allowConstantLoopConditions = false,
			allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing = false
		} = (context.options[0] || {}) as {
			allowConstantLoopConditions?: boolean;
			allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
		};
		const tools = getTypeScriptTools(context);
		if (!tools) {
			return {};
		}

		const { service, ts } = tools;
		const checker = service.program.getTypeChecker();
		const sourceCode = getSourceCode(context);
		const compilerOptions = service.program.getCompilerOptions();
		const isStrictNullChecks = compilerOptions.strict
			? compilerOptions.strictNullChecks !== false
			: compilerOptions.strictNullChecks;

		if (!isStrictNullChecks && allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true) {
			context.report({
				loc: {
					start: { line: 0, column: 0 },
					end: { line: 0, column: 0 }
				},
				messageId: 'noStrictNullCheck'
			});
		}

		const mutableVarReferenceIds: (TSESTree.Identifier | TSESTree.JSXIdentifier)[] = [];
		const scriptElements: AST.SvelteScriptElement[] = [];
		let inSvelteReactiveStatement = false;

		// Extract references to mutable variables in the root scope.
		for (const scope of [
			sourceCode.scopeManager.globalScope,
			sourceCode.scopeManager.globalScope?.childScopes.find((scope) => scope.type === 'module')
		]) {
			if (!scope) continue;
			for (const variable of scope.variables) {
				if (
					variable.defs.some(
						(def) =>
							def.type === 'Variable' && (def.parent.kind === 'var' || def.parent.kind === 'let')
					)
				) {
					for (const reference of variable.references) {
						mutableVarReferenceIds.push(reference.identifier);
					}
				}
			}
		}

		// Extract <script> ranges.
		for (const body of sourceCode.ast.body) {
			if (body.type === 'SvelteScriptElement') {
				scriptElements.push(body);
			}
		}

		/**
		 * Checks whether the given expression node is in Svelte reactive scope
		 * and the variables that make up the given expression node use
		 * mutable variables declared in component root scope.
		 */
		function hasSvelteReactiveVar(node: TSESTree.Expression | TSESTree.SpreadElement): boolean {
			const inReactiveScope =
				inSvelteReactiveStatement ||
				(scriptElements.length &&
					scriptElements.every(
						(elem) => node.range[1] <= elem.range[0] || elem.range[1] <= node.range[0]
					));
			if (!inReactiveScope) {
				// The given expression node is neither in a reactive scope nor in a template scope.
				return false;
			}

			return mutableVarReferenceIds.some(
				(id) => node.range[0] <= id.range[0] && id.range[1] <= node.range[1]
			);
		}

		/** Get the TS type from ES Node */
		function getNodeType(
			node: TSESTree.Expression | TSESTree.PrivateIdentifier | TSESTree.SpreadElement
		): TS.Type | undefined {
			const tsNode = service.esTreeNodeToTSNodeMap.get(node);
			return tsNode && getConstrainedTypeAtLocation(checker, tsNode);
		}

		/**
		 * Check whether the given node is an array type or not.
		 */
		function nodeIsArrayType(node: TSESTree.Expression): boolean {
			const nodeType = getNodeType(node);
			if (!nodeType) {
				return false;
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- isArrayType is an internal API of TS.
			return (checker as any).isArrayType(nodeType);
		}

		/**
		 * Check whether the given node is an tuple type or not.
		 */
		function nodeIsTupleType(node: TSESTree.Expression): boolean {
			const nodeType = getNodeType(node);
			return Boolean(nodeType && isTupleType(nodeType, ts));
		}

		/**
		 * Check whether the given node is an array index signature or not.
		 */
		function isArrayIndexExpression(node: TSESTree.Expression): boolean {
			return (
				// Is an index signature
				node.type === 'MemberExpression' &&
				node.computed &&
				// ...into an array type
				(nodeIsArrayType(node.object) ||
					// ... or a tuple type
					(nodeIsTupleType(node.object) &&
						// Exception: literal index into a tuple - will have a sound type
						node.property.type !== 'Literal'))
			);
		}

		/**
		 * Checks if a conditional node is necessary:
		 * if the type of the node is always true or always false, it's not necessary.
		 */
		function checkNode(node: TSESTree.Expression, isUnaryNotArgument = false): void {
			if (hasSvelteReactiveVar(node)) {
				return;
			}

			// Check if the node is Unary Negation expression and handle it
			if (node.type === 'UnaryExpression' && node.operator === '!') {
				checkNode(node.argument, true);
				return;
			}

			// Since typescript array index signature types don't represent the
			//  possibility of out-of-bounds access, if we're indexing into an array
			//  just skip the check, to avoid false positives
			if (isArrayIndexExpression(node)) {
				return;
			}

			// When checking logical expressions, only check the right side
			//  as the left side has been checked by checkLogicalExpressionForUnnecessaryConditionals
			//
			// Unless the node is nullish coalescing, as it's common to use patterns like `nullBool ?? true` to to strict
			//  boolean checks if we inspect the right here, it'll usually be a constant condition on purpose.
			// In this case it's better to inspect the type of the expression as a whole.
			if (node.type === 'LogicalExpression' && node.operator !== '??') {
				checkNode(node.right);
				return;
			}

			const type = getNodeType(node);

			// Conditional is always necessary if it involves:
			//    `any` or `unknown` or a naked type parameter
			if (
				!type ||
				unionTypeParts(type).some(
					(part) => isAnyType(part, ts) || isUnknownType(part, ts) || part.isTypeParameter()
				)
			) {
				return;
			}
			let messageId: string | null = null;

			if (unionTypeParts(type).some((part) => isNeverType(part, ts))) {
				messageId = 'never';
			} else if (!isPossiblyTruthy(type, tools!)) {
				messageId = !isUnaryNotArgument ? 'alwaysFalsy' : 'alwaysTruthy';
			} else if (!isPossiblyFalsy(type, tools!)) {
				messageId = !isUnaryNotArgument ? 'alwaysTruthy' : 'alwaysFalsy';
			}

			if (messageId) {
				context.report({ node, messageId });
			}
		}

		/**
		 * Checks if a conditional node is necessary from the given lhs of nullish coalescing.
		 */
		function checkNodeForNullish(node: TSESTree.Expression): void {
			if (hasSvelteReactiveVar(node)) {
				return;
			}

			const type = getNodeType(node);
			// Conditional is always necessary if it involves `any` or `unknown`
			if (!type || isAnyType(type, ts) || isUnknownType(type, ts)) {
				return;
			}

			let messageId: string | null = null;
			if (unionTypeParts(type).some((part) => isNeverType(part, ts))) {
				messageId = 'never';
			} else if (!isPossiblyNullish(type, tools!)) {
				// Since typescript array index signature types don't represent the
				//  possibility of out-of-bounds access, if we're indexing into an array
				//  just skip the check, to avoid false positives
				if (
					!isArrayIndexExpression(node) &&
					!(
						node.type === 'ChainExpression' &&
						node.expression.type !== 'TSNonNullExpression' &&
						optionChainContainsOptionArrayIndex(node.expression)
					)
				) {
					messageId = 'neverNullish';
				}
			} else if (isAlwaysNullish(type, tools!)) {
				messageId = 'alwaysNullish';
			}

			if (messageId) {
				context.report({ node, messageId });
			}
		}

		/**
		 * Checks that a binary expression is necessarily conditional, reports otherwise.
		 * If both sides of the binary expression are literal values, it's not a necessary condition.
		 *
		 * NOTE: It's also unnecessary if the types that don't overlap at all
		 *    but that case is handled by the Typescript compiler itself.
		 *    Known exceptions:
		 *      * https://github.com/microsoft/TypeScript/issues/32627
		 *      * https://github.com/microsoft/TypeScript/issues/37160 (handled)
		 */
		const BOOL_OPERATORS = new Set(['<', '>', '<=', '>=', '==', '===', '!=', '!==']);

		/**
		 * Checks if a conditional node is necessary from the given binary expression.
		 */
		function checkIfBinaryExpressionIsNecessaryConditional(node: TSESTree.BinaryExpression): void {
			if (hasSvelteReactiveVar(node)) {
				return;
			}

			if (!BOOL_OPERATORS.has(node.operator)) {
				return;
			}
			const leftType = getNodeType(node.left);
			const rightType = getNodeType(node.right);
			if (!leftType || !rightType) {
				return;
			}
			if (isLiteral(leftType, tools!) && isLiteral(rightType, tools!)) {
				context.report({ node, messageId: 'literalBooleanExpression' });
				return;
			}
			// Workaround for https://github.com/microsoft/TypeScript/issues/37160
			if (isStrictNullChecks) {
				const UNDEFINED = ts.TypeFlags.Undefined;
				const NULL = ts.TypeFlags.Null;
				// eslint-disable-next-line func-style -- ignore
				const isComparable = (type: TS.Type, f: TS.TypeFlags): boolean => {
					let flag = f;
					// Allow comparison to `any`, `unknown` or a naked type parameter.
					flag |= ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter;

					// Allow loose comparison to nullish values.
					if (node.operator === '==' || node.operator === '!=') {
						flag |= NULL | UNDEFINED;
					}

					return unionTypeParts(type).some((t) => (t.flags & flag) !== 0);
				};

				if (
					(leftType.flags === UNDEFINED && !isComparable(rightType, UNDEFINED)) ||
					(rightType.flags === UNDEFINED && !isComparable(leftType, UNDEFINED)) ||
					(leftType.flags === NULL && !isComparable(rightType, NULL)) ||
					(rightType.flags === NULL && !isComparable(leftType, NULL))
				) {
					context.report({ node, messageId: 'noOverlapBooleanExpression' });
				}
			}
		}

		/**
		 * Checks that a logical expression contains a boolean, reports otherwise.
		 */
		function checkLogicalExpressionForUnnecessaryConditionals(
			node: TSESTree.LogicalExpression
		): void {
			if (node.operator === '??') {
				checkNodeForNullish(node.left);
				return;
			}
			// Only checks the left side, since the right side might not be "conditional" at all.
			// The right side will be checked if the LogicalExpression is used in a conditional context
			checkNode(node.left);
		}

		/**
		 * Checks that a testable expression of a loop is necessarily conditional, reports otherwise.
		 */
		function checkIfLoopIsNecessaryConditional(
			node: TSESTree.DoWhileStatement | TSESTree.ForStatement | TSESTree.WhileStatement
		): void {
			if (node.test === null) {
				// e.g. `for(;;)`
				return;
			}

			/**
			 * Allow:
			 *   while (true) {}
			 *   for (;true;) {}
			 *   do {} while (true)
			 */
			if (allowConstantLoopConditions) {
				const nodeType = getNodeType(node.test);
				if (
					nodeType &&
					isBooleanLiteralType(nodeType, ts) &&
					checker.typeToString(nodeType) === 'true'
				)
					return;
			}

			checkNode(node.test);
		}

		const ARRAY_PREDICATE_FUNCTIONS = new Set(['filter', 'find', 'some', 'every']);

		/**
		 * Checks whether the given call expression is an array method that takes a predicate as an argument.
		 */
		function isArrayPredicateFunction(node: TSESTree.CallExpression): boolean {
			const { callee } = node;
			return (
				// looks like `something.filter` or `something.find`
				callee.type === 'MemberExpression' &&
				callee.property.type === 'Identifier' &&
				ARRAY_PREDICATE_FUNCTIONS.has(callee.property.name) &&
				// and the left-hand side is an array, according to the types
				(nodeIsArrayType(callee.object) || nodeIsTupleType(callee.object))
			);
		}

		/**
		 * Checks if a conditional node is necessary from the given call expression.
		 */
		function checkCallExpression(node: TSESTree.CallExpression): void {
			// If this is something like arr.filter(x => /*condition*/), check `condition`
			if (isArrayPredicateFunction(node) && node.arguments.length) {
				const callback = node.arguments[0];
				// Inline defined functions
				if (
					(callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') &&
					callback.body
				) {
					// Two special cases, where we can directly check the node that's returned:
					// () => something
					if (callback.body.type !== 'BlockStatement') {
						checkNode(callback.body);
						return;
					}
					// () => { return something; }
					const callbackBody = callback.body.body;
					if (
						callbackBody.length === 1 &&
						callbackBody[0].type === 'ReturnStatement' &&
						callbackBody[0].argument
					) {
						checkNode(callbackBody[0].argument);
						return;
					}
					// Potential enhancement: could use code-path analysis to check
					//   any function with a single return statement
					// (Value to complexity ratio is dubious however)
				}
				const nodeType = getNodeType(callback);
				if (!nodeType) {
					return;
				}
				// Otherwise just do type analysis on the function as a whole.
				const returnTypes = getCallSignaturesOfType(nodeType).map((sig) => sig.getReturnType());
				/* istanbul ignore if */ if (returnTypes.length === 0) {
					// Not a callable function
					return;
				}
				// Predicate is always necessary if it involves `any` or `unknown`
				if (returnTypes.some((t) => isAnyType(t, ts) || isUnknownType(t, ts))) {
					return;
				}
				if (!returnTypes.some((t) => isPossiblyFalsy(t, tools!))) {
					context.report({
						node: callback,
						messageId: 'alwaysTruthyFunc'
					});
					return;
				}
				if (!returnTypes.some((t) => isPossiblyTruthy(t, tools!))) {
					context.report({
						node: callback,
						messageId: 'alwaysFalsyFunc'
					});
				}
			}
		}

		/**
		 *
		 * Recursively searches an optional chain for an array index expression
		 *  Has to search the entire chain, because an array index will "infect" the rest of the types
		 *  Example:
		 *  ```
		 *  [{x: {y: "z"} }][n] // type is {x: {y: "z"}}
		 *    ?.x // type is {y: "z"}
		 *    ?.y // This access is considered "unnecessary" according to the types
		 *  ```
		 */
		function optionChainContainsOptionArrayIndex(
			node: TSESTree.MemberExpression | TSESTree.CallExpression
		): boolean {
			const lhsNode = node.type === 'CallExpression' ? node.callee : node.object;
			if (node.optional && isArrayIndexExpression(lhsNode)) {
				return true;
			}
			if (lhsNode.type === 'MemberExpression' || lhsNode.type === 'CallExpression') {
				return optionChainContainsOptionArrayIndex(lhsNode);
			}
			return false;
		}

		/**
		 * Check whether the given property is a nullable or not.
		 */
		function isNullablePropertyType(objType: TS.Type, propertyType: TS.Type): boolean {
			if (propertyType.isUnion()) {
				return propertyType.types.some((type) => isNullablePropertyType(objType, type));
			}
			if (propertyType.isNumberLiteral() || propertyType.isStringLiteral()) {
				const propType = getTypeOfPropertyOfType(objType, propertyType.value.toString(), checker);
				if (propType) {
					return isNullableType(propType, ts);
				}
			}
			const typeName = getTypeName(propertyType, tools!);
			return Boolean(
				(typeName === 'string' && checker.getIndexInfoOfType(objType, ts.IndexKind.String)) ||
					(typeName === 'number' && checker.getIndexInfoOfType(objType, ts.IndexKind.Number))
			);
		}

		/**
		 * Checks whether a member expression is nullable or not regardless of it's previous node.
		 *  Example:
		 *  ```
		 *  // 'bar' is nullable if 'foo' is null.
		 *  // but this function checks regardless of 'foo' type, so returns 'true'.
		 *  declare const foo: { bar : { baz: string } } | null
		 *  foo?.bar;
		 *  ```
		 */
		function isNullableOriginFromPrev(node: TSESTree.MemberExpression): boolean {
			const prevType = getNodeType(node.object);
			const property = node.property;
			if (prevType && prevType.isUnion() && property.type === 'Identifier') {
				const isOwnNullable = prevType.types.some((type) => {
					if (node.computed) {
						const propertyType = getNodeType(node.property);
						return Boolean(propertyType && isNullablePropertyType(type, propertyType));
					}
					const propType = getTypeOfPropertyOfType(type, property.name, checker);
					return propType && isNullableType(propType, ts);
				});
				return !isOwnNullable && isNullableType(prevType, ts);
			}
			return false;
		}

		/**
		 * Checks whether a lhs expression is optionable or not.
		 */
		function isOptionableExpression(node: TSESTree.Expression): boolean {
			const type = getNodeType(node);
			if (!type) {
				return false;
			}
			const isOwnNullable =
				node.type === 'MemberExpression' ? !isNullableOriginFromPrev(node) : true;
			return (
				isAnyType(type, ts) ||
				isUnknownType(type, ts) ||
				(isNullableType(type, ts) && isOwnNullable)
			);
		}

		/**
		 * Checks if a conditional node is necessary from the given optional chaining expression.
		 */
		function checkOptionalChain(
			node: TSESTree.MemberExpression | TSESTree.CallExpression,
			beforeOperator: TSESTree.Node,
			fix: '' | '.'
		): void {
			// We only care if this step in the chain is optional. If just descend
			// from an optional chain, then that's fine.
			if (!node.optional) {
				return;
			}

			// Since typescript array index signature types don't represent the
			//  possibility of out-of-bounds access, if we're indexing into an array
			//  just skip the check, to avoid false positives
			if (optionChainContainsOptionArrayIndex(node)) {
				return;
			}

			const nodeToCheck = node.type === 'CallExpression' ? node.callee : node.object;

			if (hasSvelteReactiveVar(nodeToCheck)) {
				return;
			}

			if (isOptionableExpression(nodeToCheck)) {
				return;
			}

			const questionDotOperator = sourceCode.getTokenAfter(beforeOperator, {
				includeComments: false,
				filter: (token) => token.type === 'Punctuator' && token.value === '?.'
			})!;

			context.report({
				node,
				loc: questionDotOperator.loc,
				messageId: 'neverOptionalChain',
				fix(fixer) {
					return fixer.replaceText(questionDotOperator, fix);
				}
			});
		}

		/**
		 * Checks for optional member expression
		 */
		function checkOptionalMemberExpression(node: TSESTree.MemberExpression): void {
			checkOptionalChain(node, node.object, node.computed ? '' : '.');
		}

		/**
		 * Checks for optional call expression
		 */
		function checkOptionalCallExpression(node: TSESTree.CallExpression): void {
			checkOptionalChain(node, node.callee, '');
		}

		return {
			SvelteReactiveStatement: () => (inSvelteReactiveStatement = true),
			'SvelteReactiveStatement:exit': () => (inSvelteReactiveStatement = false),
			BinaryExpression: checkIfBinaryExpressionIsNecessaryConditional,
			CallExpression: checkCallExpression,
			ConditionalExpression: (node: TSESTree.ConditionalExpression): void => checkNode(node.test),
			DoWhileStatement: checkIfLoopIsNecessaryConditional,
			ForStatement: checkIfLoopIsNecessaryConditional,
			IfStatement: (node: TSESTree.IfStatement): void => checkNode(node.test),
			LogicalExpression: checkLogicalExpressionForUnnecessaryConditionals,
			WhileStatement: checkIfLoopIsNecessaryConditional,
			'MemberExpression[optional = true]': checkOptionalMemberExpression,
			'CallExpression[optional = true]': checkOptionalCallExpression
		};
	}
});
