import type { RuleContext, ASTNode } from '../../types.js';
import type * as TS from 'typescript';
import { loadModule } from '../load-module.js';
import { getSourceCode } from '../compat.js';
export type TypeScript = typeof TS;
export type { TS };

export type TSTools = {
	service: {
		esTreeNodeToTSNodeMap: ReadonlyMap<unknown, TS.Node>;
		tsNodeToESTreeNodeMap: ReadonlyMap<TS.Node, ASTNode>;
		program: TS.Program;
		hasFullTypeInformation: boolean;
	};
	ts: TypeScript;
};

/**
 * Get TypeScript tools
 */
export function getTypeScriptTools(context: RuleContext): TSTools | null {
	const ts = getTypeScript(context);
	if (!ts) {
		return null;
	}
	const sourceCode = getSourceCode(context);
	const { program, esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap } = sourceCode.parserServices;
	if (!program || !esTreeNodeToTSNodeMap || !tsNodeToESTreeNodeMap) {
		return null;
	}
	const hasFullTypeInformation = sourceCode.parserServices.hasFullTypeInformation ?? true;

	if (!hasFullTypeInformation) {
		// Full type information is required. User must specify parserOptions.project.
		return null;
	}

	return {
		service: {
			esTreeNodeToTSNodeMap,
			tsNodeToESTreeNodeMap,
			hasFullTypeInformation,
			program
		},
		ts
	};
}

let cacheTypeScript: TypeScript | null = null;
/**
 * Get TypeScript tools
 */
export function getTypeScript(context: RuleContext): TypeScript | null {
	if (cacheTypeScript) {
		return cacheTypeScript;
	}
	cacheTypeScript = loadModule(context, 'typescript');
	if (cacheTypeScript) {
		return cacheTypeScript;
	}
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
		cacheTypeScript ??= require('typescript');
	} catch {
		// ignore
	}
	return cacheTypeScript;
}
/**
 * Check whether the given type is a truthy literal type or not.
 */
export function isTruthyLiteral(type: TS.Type, tsTools: TSTools): boolean {
	if (type.isUnion()) {
		return type.types.every((t) => isTruthyLiteral(t, tsTools));
	}
	return (
		(isBooleanLiteralType(type, tsTools.ts) &&
			tsTools.service.program.getTypeChecker().typeToString(type) === 'true') ||
		(type.isLiteral() && Boolean(type.value))
	);
}

/**
 * Check whether the given type is a falsy type or not.
 */
export function isFalsyType(type: TS.Type, tsTools: TSTools): boolean {
	if (type.isUnion()) {
		return type.types.every((t) => isFalsyType(t, tsTools));
	}
	if (
		isUndefinedType(type, tsTools.ts) ||
		isNullType(type, tsTools.ts) ||
		isVoidType(type, tsTools.ts)
	)
		return true;
	if (type.isLiteral()) return !type.value;
	return (
		isBooleanLiteralType(type, tsTools.ts) &&
		tsTools.service.program.getTypeChecker().typeToString(type) === 'false'
	);
}
/**
 * Check whether the given type is a nullish type or not.
 */
export function isNullishType(type: TS.Type, ts: TypeScript): boolean {
	if (type.isUnion()) {
		return type.types.every((t) => isNullishType(t, ts));
	}
	return isNullType(type, ts) || isUndefinedType(type, ts);
}

/**
 * Checks whether the given type is nullable or not.
 */
export function isNullableType(type: TS.Type, ts: TypeScript): boolean {
	if (type.isUnion()) {
		return type.types.some((t) => isNullableType(t, ts));
	}
	return isNullType(type, ts) || isUndefinedType(type, ts);
}
/**
 * Check whether the given type is a boolean literal type or not.
 */
export function isBooleanLiteralType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.BooleanLiteral) !== 0;
}

/**
 * Check whether the given type is an object type or not.
 */
export function isObjectType(type: TS.Type, ts: TypeScript): type is TS.ObjectType {
	return (type.flags & ts.TypeFlags.Object) !== 0;
}
/**
 * Check whether the given type is a reference type or not.
 */
export function isReferenceObjectType(type: TS.Type, ts: TypeScript): type is TS.TypeReference {
	return isObjectType(type, ts) && (type.objectFlags & ts.ObjectFlags.Reference) !== 0;
}
/**
 * Check whether the given type is a tuple type or not.
 */
export function isTupleObjectType(type: TS.Type, ts: TypeScript): type is TS.TupleType {
	return isObjectType(type, ts) && (type.objectFlags & ts.ObjectFlags.Tuple) !== 0;
}
/**
 * Check whether the given type is a tuple type or not.
 * Unlike isTupleObjectType, it also refers to reference types.
 */
export function isTupleType(type: TS.Type, ts: TypeScript): boolean {
	return (
		isTupleObjectType(type, ts) ||
		(isReferenceObjectType(type, ts) && isTupleObjectType(type.target, ts))
	);
}

/**
 * Check whether the given type is an any type or not.
 */
export function isAnyType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Any) !== 0;
}
/**
 * Check whether the given type is an unknown type or not.
 */
export function isUnknownType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Unknown) !== 0;
}
/**
 * Check whether the given type is a never type or not.
 */
export function isNeverType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Never) !== 0;
}
/**
 * Check whether the given type is an undefined type or not.
 */
export function isUndefinedType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Undefined) !== 0;
}
/**
 * Check whether the given type is a void type or not.
 */
export function isVoidType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Void) !== 0;
}
/**
 * Check whether the given type is a null type or not.
 */
export function isNullType(type: TS.Type, ts: TypeScript): boolean {
	return (type.flags & ts.TypeFlags.Null) !== 0;
}
/**
 * Check whether the given type is a possibly falsy type or not.
 */
export function isPossiblyFalsyType(type: TS.Type, ts: TypeScript): boolean {
	if (type.isUnion()) {
		return type.types.some((t) => isPossiblyFalsyType(t, ts));
	}
	return (type.flags & ts.TypeFlags.PossiblyFalsy) !== 0;
}

/**
 * Get the call signatures from the given type.
 * This method is heavily inspired by tsutils. https://github.com/ajafff/tsutils
 * The MIT License (MIT) Copyright (c) 2017 Klaus Meinhardt
 * https://github.com/ajafff/tsutils/blob/master/LICENSE
 */
export function getCallSignaturesOfType(type: TS.Type): readonly TS.Signature[] {
	if (type.isUnion()) {
		return type.types.flatMap((t) => getCallSignaturesOfType(t));
	}
	if (type.isIntersection()) {
		let signatures: readonly TS.Signature[] = [];
		for (const t of type.types) {
			const sig = getCallSignaturesOfType(t);
			if (sig.length !== 0) {
				if (signatures.length) {
					// if more than one type of the intersection has call signatures, none of them is useful for inference
					return [];
				}
				signatures = sig;
			}
		}
		return signatures;
	}
	return type.getCallSignatures();
}

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 * Copied this method from @typescript-eslint/type-utils. https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils
 * The MIT License (MIT) Copyright (c) 2021 TypeScript ESLint and other contributors
 * https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils/LICENSE
 */
export function getConstrainedTypeAtLocation(checker: TS.TypeChecker, node: TS.Node): TS.Type {
	const nodeType = checker.getTypeAtLocation(node);
	const constrained = checker.getBaseConstraintOfType(nodeType);

	return constrained ?? nodeType;
}

/**
 * Get the type name of a given type.
 *
 * Copied this method from @typescript-eslint/type-utils. https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils
 * The MIT License (MIT) Copyright (c) 2021 TypeScript ESLint and other contributors
 * https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils/LICENSE
 *
 * @param type The type to get the name of.
 */
export function getTypeName(type: TS.Type, tsTools: TSTools): string {
	const { ts } = tsTools;
	// It handles `string` and string literal types as string.
	if ((type.flags & ts.TypeFlags.StringLike) !== 0) {
		return 'string';
	}

	const typeChecker = tsTools.service.program.getTypeChecker();

	// If the type is a type parameter which extends primitive string types,
	// but it was not recognized as a string like. So check the constraint
	// type of the type parameter.
	if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
		// `type.getConstraint()` method doesn't return the constraint type of
		// the type parameter for some reason. So this gets the constraint type
		// via AST.
		const symbol = type.getSymbol();
		const decls = symbol?.getDeclarations();
		const typeParamDecl = decls?.[0] as TS.TypeParameterDeclaration;
		if (ts.isTypeParameterDeclaration(typeParamDecl) && typeParamDecl.constraint != null) {
			return getTypeName(typeChecker.getTypeFromTypeNode(typeParamDecl.constraint), tsTools);
		}
	}

	// If the type is a union and all types in the union are string like,
	// return `string`. For example:
	// - `"a" | "b"` is string.
	// - `string | string[]` is not string.
	if (
		type.isUnion() &&
		type.types.map((value) => getTypeName(value, tsTools)).every((t) => t === 'string')
	) {
		return 'string';
	}

	// If the type is an intersection and a type in the intersection is string
	// like, return `string`. For example: `string & {__htmlEscaped: void}`
	if (
		type.isIntersection() &&
		type.types.map((value) => getTypeName(value, tsTools)).some((t) => t === 'string')
	) {
		return 'string';
	}

	return typeChecker.typeToString(type);
}

/**
 * Return the type of the given property in the given type, or undefined if no such property exists
 */
export function getTypeOfPropertyOfType(
	type: TS.Type,
	name: string,
	checker: TS.TypeChecker
): TS.Type | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- getTypeOfPropertyOfType is an internal API of TS.
	return (checker as any).getTypeOfPropertyOfType(type, name);
}
