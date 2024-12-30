import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import type { RuleContext } from '../../types.js';
import type { TS, TSTools } from '../../utils/ts-utils/index.js';
import { getTypeScriptTools } from '../../utils/ts-utils/index.js';
import { findVariable, getParent } from '../../utils/ast-utils.js';
import { getSourceCode } from '../../utils/compat.js';

type StoreName = 'writable' | 'readable' | 'derived';

/** Extract 'svelte/store' references */
export function* extractStoreReferences(
	context: RuleContext,
	storeNames: StoreName[] = ['writable', 'readable', 'derived']
): Generator<{ node: TSESTree.CallExpression; name: string }, void> {
	const referenceTracker = new ReferenceTracker(getSourceCode(context).scopeManager.globalScope!);
	for (const { node, path } of referenceTracker.iterateEsmReferences({
		'svelte/store': {
			[ReferenceTracker.ESM]: true,
			writable: {
				[ReferenceTracker.CALL]: storeNames.includes('writable')
			},
			readable: {
				[ReferenceTracker.CALL]: storeNames.includes('readable')
			},
			derived: {
				[ReferenceTracker.CALL]: storeNames.includes('derived')
			}
		}
	})) {
		yield {
			node: node as TSESTree.CallExpression,
			name: path[path.length - 1]
		};
	}
}

export type StoreChecker = (
	node: TSESTree.Expression,
	options?: { consistent?: boolean }
) => boolean;
type StoreCheckerWithOptions = (
	node: TSESTree.Expression,
	options: { consistent: boolean }
) => boolean;

/**
 * Creates a function that checks whether the given expression node is a store instance or not.
 */
export function createStoreChecker(context: RuleContext): StoreChecker {
	const tools = getTypeScriptTools(context);
	const checker = tools ? createStoreCheckerForTS(tools) : createStoreCheckerForES(context);

	return (node, options) =>
		checker(node, {
			consistent: options?.consistent ?? false
		});
}

/**
 * Creates a function that checks whether the given expression node is a store instance or not, for EcmaScript.
 */
function createStoreCheckerForES(context: RuleContext): StoreCheckerWithOptions {
	const storeVariables = new Map<Variable, { const: boolean }>();
	for (const { node } of extractStoreReferences(context)) {
		const parent = getParent(node);
		if (!parent || parent.type !== 'VariableDeclarator' || parent.id.type !== 'Identifier') {
			continue;
		}
		const decl = getParent(parent);
		if (!decl || decl.type !== 'VariableDeclaration') {
			continue;
		}

		const variable = findVariable(context, parent.id);
		if (variable) {
			storeVariables.set(variable, { const: decl.kind === 'const' });
		}
	}

	return (node, options) => {
		if (node.type !== 'Identifier' || node.name.startsWith('$')) {
			return false;
		}
		const variable = findVariable(context, node);
		if (!variable) {
			return false;
		}
		const info = storeVariables.get(variable);
		if (!info) {
			return false;
		}
		return options.consistent ? info.const : true;
	};
}

/**
 * Creates a function that checks whether the given expression node is a store instance or not, for TypeScript.
 */
function createStoreCheckerForTS(tools: TSTools): StoreCheckerWithOptions {
	const { service } = tools;
	const checker = service.program.getTypeChecker();
	const tsNodeMap = service.esTreeNodeToTSNodeMap;

	return (node, options) => {
		const tsNode = tsNodeMap.get(node);
		if (!tsNode) {
			return false;
		}
		const type = checker.getTypeAtLocation(tsNode);

		return isStoreType(checker.getApparentType(type));

		/**
		 * Checks whether the given type is a store or not
		 */
		function isStoreType(type: TS.Type): boolean {
			return eachTypeCheck(type, options, (type) => {
				const subscribe = type.getProperty('subscribe');
				if (!subscribe) {
					return false;
				}
				const subscribeType = checker.getTypeOfSymbolAtLocation(subscribe, tsNode!);
				return isStoreSubscribeSignatureType(subscribeType);
			});
		}

		/**
		 * Checks whether the given type is a store's subscribe or not
		 */
		function isStoreSubscribeSignatureType(type: TS.Type): boolean {
			return eachTypeCheck(type, options, (type) => {
				for (const signature of type.getCallSignatures()) {
					if (
						signature.parameters.length >= 2 &&
						maybeFunctionSymbol(signature.parameters[0]) &&
						maybeFunctionSymbol(signature.parameters[1])
					) {
						return true;
					}
				}
				return false;
			});
		}

		/**
		 * Checks whether the given symbol maybe function param or not
		 */
		function maybeFunctionSymbol(param: TS.Symbol): boolean {
			const type: TS.Type | undefined = checker.getApparentType(
				checker.getTypeOfSymbolAtLocation(param, tsNode!)
			);
			return maybeFunctionType(type);
		}

		/**
		 * Checks whether the given type is maybe function param or not
		 */
		function maybeFunctionType(type: TS.Type): boolean {
			return eachTypeCheck(type, { consistent: false }, (type) => {
				return type.getCallSignatures().length > 0;
			});
		}
	};
}

/**
 * Check the given type with the given check function.
 * For union types, `options.consistent: true` requires all types to pass the check function.
 * `options.consistent: false` considers a match if any type passes the check function.
 */
function eachTypeCheck(
	type: TS.Type,
	options: { consistent: boolean },
	check: (t: TS.Type) => boolean
): boolean {
	if (type.isUnion()) {
		if (options.consistent) {
			return type.types.every((t) => eachTypeCheck(t, options, check));
		}
		return type.types.some((t) => eachTypeCheck(t, options, check));
	}
	return check(type);
}
