import { createRule } from '../utils/index.js';
import {
	type TSTools,
	getTypeScriptTools,
	isMethodSymbol,
	isPropertySignatureKind,
	isFunctionTypeKind,
	isAnyType,
	isNeverType,
	isNullType,
	isUndefinedType,
	isUnknownType,
	isVoidType,
	getCallSignaturesOfType
} from '../utils/ts-utils/index.js';
import type * as TS from 'typescript';
import type { RuleContext } from '../types.js';
import type { CallExpression } from 'estree';

export default createRule('require-event-prefix', {
	meta: {
		docs: {
			description: 'require component event names to start with "on"',
			category: 'Stylistic Issues',
			conflictWithPrettier: false,
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					checkAsyncFunctions: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			nonPrefixedFunction: 'Component event name must start with "on".'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				svelteFileTypes: ['.svelte']
			}
		]
	},
	create(context) {
		const tsTools = getTypeScriptTools(context);
		if (!tsTools) {
			return {};
		}

		const checkAsyncFunctions = context.options[0]?.checkAsyncFunctions ?? false;
		let checkContext: CheckContext | undefined;

		return {
			CallExpression(node) {
				const propsType = getPropsType(node, tsTools);
				if (propsType === undefined) {
					return;
				}
				for (const property of propsType.getProperties()) {
					if (
						isFunctionLike(property, tsTools) &&
						!property.getName().startsWith('on') &&
						isEventLike(
							property,
							(checkContext ??= {
								tsTools,
								checkAsyncFunctions,
								genericDeclarations: getGenericDeclarations(context, tsTools),
								genericsCache: new Map()
							})
						)
					) {
						const declarationTsNode = property.getDeclarations()?.[0];
						const declarationEstreeNode =
							declarationTsNode !== undefined
								? tsTools.service.tsNodeToESTreeNodeMap.get(declarationTsNode)
								: undefined;
						context.report({
							node: declarationEstreeNode ?? node,
							messageId: 'nonPrefixedFunction'
						});
					}
				}
			}
		};
	}
});

function getPropsType(node: CallExpression, tsTools: TSTools): TS.Type | undefined {
	if (
		node.callee.type !== 'Identifier' ||
		node.callee.name !== '$props' ||
		node.parent.type !== 'VariableDeclarator'
	) {
		return undefined;
	}

	const tsNode = tsTools.service.esTreeNodeToTSNodeMap.get(node.parent.id);
	if (tsNode === undefined) {
		return undefined;
	}

	return tsTools.service.program.getTypeChecker().getTypeAtLocation(tsNode);
}

function isFunctionLike(functionSymbol: TS.Symbol, tsTools: TSTools): boolean {
	return (
		isMethodSymbol(functionSymbol, tsTools.ts) ||
		(functionSymbol.valueDeclaration !== undefined &&
			isPropertySignatureKind(functionSymbol.valueDeclaration, tsTools.ts) &&
			functionSymbol.valueDeclaration.type !== undefined &&
			isFunctionTypeKind(functionSymbol.valueDeclaration.type, tsTools.ts))
	);
}

type CheckContext = {
	tsTools: TSTools;
	checkAsyncFunctions: boolean;
	/** Type alias declarations that svelte-eslint-parser creates for `<script generics="...">`. */
	genericDeclarations: ReadonlySet<TS.Node>;
	/** Cache for `collectGenerics`. */
	genericsCache: Map<TS.Node, ReadonlySet<TS.Node>>;
};

/**
 * Returns the TS declarations of the component generics (`<script generics="T">`).
 * svelte-eslint-parser turns each of them into a type alias, e.g. `type T = unknown;`.
 */
function getGenericDeclarations(context: RuleContext, tsTools: TSTools): Set<TS.Node> {
	const declarations = new Set<TS.Node>();
	for (const element of context.sourceCode.ast.body) {
		if (element.type !== 'SvelteScriptElement') {
			continue;
		}
		for (const attribute of element.startTag.attributes) {
			if (attribute.type !== 'SvelteGenericsDirective') {
				continue;
			}
			for (const param of attribute.params) {
				const tsNode = tsTools.service.esTreeNodeToTSNodeMap.get(param.name);
				if (tsNode?.parent !== undefined) {
					declarations.add(tsNode.parent);
				}
			}
		}
	}
	return declarations;
}

/**
 * Checks whether the function looks like an event handler, based on its return type.
 * - No value (`void`, `undefined`, `null`, `never`): event.
 * - `any` / `unknown`: event, because we cannot tell. But if it comes from a generic, it is a value.
 * - Unions are an event only if all members are (e.g. `void | Promise<void>`).
 * - Promise-like of the above (e.g. `Promise<void>`): event only when `checkAsyncFunctions` is enabled.
 * - A return type that uses a generic (e.g. `T` in `<script generics="T">`): not an event,
 *   unless the constraint of the generic is `void`, `undefined`, `null`, or a Promise of them.
 * - Anything else (e.g. `getHref: (item: T) => string`): not an event.
 */
function isEventLike(functionSymbol: TS.Symbol, ctx: CheckContext): boolean {
	const declaration = functionSymbol.valueDeclaration ?? functionSymbol.getDeclarations()?.[0];
	if (declaration === undefined) {
		return true;
	}
	const checker = ctx.tsTools.service.program.getTypeChecker();
	const signatures = getCallSignaturesOfType(
		checker.getTypeOfSymbolAtLocation(functionSymbol, declaration)
	);
	if (signatures.length === 0) {
		return true;
	}
	const kinds = signatures.map((signature): ReturnKind => {
		const signatureDeclaration = signature.getDeclaration() as TS.SignatureDeclaration | undefined;
		const returnTypeNode = signatureDeclaration?.type;
		const type = checker.getReturnTypeOfSignature(signature);
		if (returnTypeNode === undefined) {
			return getReturnKind(type, ctx, () => false);
		}
		const kind = getReturnKind(type, ctx, () =>
			[...collectGenerics(returnTypeNode, ctx)].some((generic) =>
				isGenericInScope(generic, returnTypeNode, ctx)
			)
		);
		if (kind === 'value') {
			return kind;
		}
		// A generic can only turn an event into a value, so check it last.
		return (ctx.genericDeclarations.size > 0 ||
			signatureDeclaration?.typeParameters !== undefined) &&
			[...collectGenerics(returnTypeNode, ctx)].some((generic) =>
				isValueGeneric(generic, returnTypeNode, ctx)
			)
			? 'value'
			: kind;
	});
	// Like a union, overloads are synchronous if any signature can return synchronously.
	return !kinds.includes('value') && (kinds.includes('void') || ctx.checkAsyncFunctions);
}

type ReturnKind = 'void' | 'async' | 'value';

/**
 * @param fromGeneric Whether `any` / `unknown` in the type may come from a generic.
 */
function getReturnKind(type: TS.Type, ctx: CheckContext, fromGeneric: () => boolean): ReturnKind {
	const { ts } = ctx.tsTools;
	const checker = ctx.tsTools.service.program.getTypeChecker();
	if (
		isVoidType(type, ts) ||
		isUndefinedType(type, ts) ||
		isNullType(type, ts) ||
		isNeverType(type, ts)
	) {
		return 'void';
	}
	if (isAnyType(type, ts) || isUnknownType(type, ts)) {
		return fromGeneric() ? 'value' : 'void';
	}
	if (type.isUnion()) {
		const kinds = type.types.map((t) => getReturnKind(t, ctx, fromGeneric));
		if (kinds.includes('value')) {
			return 'value';
		}
		// e.g. `void | Promise<void>` may return synchronously, so it is treated like `void`.
		return kinds.includes('void') ? 'void' : 'async';
	}
	if ((type.flags & ts.TypeFlags.Instantiable) !== 0) {
		// A type parameter (e.g. `pick<U>(): U`) or a type based on it: check its constraint.
		const constraint = checker.getBaseConstraintOfType(type);
		return constraint === undefined || constraint === type
			? 'value'
			: getReturnKind(constraint, ctx, () => true);
	}
	if (checker.getPropertyOfType(checker.getApparentType(type), 'then') === undefined) {
		return 'value';
	}
	const awaitedType = checker.getAwaitedType(type);
	if (awaitedType === undefined || awaitedType === type) {
		return 'value';
	}
	return getReturnKind(awaitedType, ctx, fromGeneric) === 'value' ? 'value' : 'async';
}

/**
 * Checks whether the declaration is a component generic, or a type parameter declared around the node
 * (e.g. `U` in `pick<U>(value: U): U`, or `X` in `interface Props<X> { get: () => X }`).
 * Type parameters of other aliases and interfaces are not, because they are replaced by type arguments.
 */
function isGenericInScope(declaration: TS.Node, node: TS.Node, ctx: CheckContext): boolean {
	if (ctx.genericDeclarations.has(declaration)) {
		return true;
	}
	if (!ctx.tsTools.ts.isTypeParameterDeclaration(declaration)) {
		return false;
	}
	for (let parent: TS.Node | undefined = node.parent; parent; parent = parent.parent) {
		if (parent === declaration.parent) {
			return true;
		}
	}
	return false;
}

/**
 * Checks whether the declaration is a generic whose actual type is unknown here, and its constraint is a value.
 * These are component generics (svelte-eslint-parser turns `T extends X` into `type T = X`,
 * so `T` is `unknown` and `keyof T` is `never`) and type parameters of the signature.
 * Type parameters of interfaces are not, because the props type has their actual types.
 */
function isValueGeneric(declaration: TS.Node, node: TS.Node, ctx: CheckContext): boolean {
	const { ts } = ctx.tsTools;
	const checker = ctx.tsTools.service.program.getTypeChecker();
	let constraint: TS.Type | undefined;
	if (ctx.genericDeclarations.has(declaration)) {
		if (!ts.isTypeAliasDeclaration(declaration)) {
			return false;
		}
		constraint = checker.getTypeFromTypeNode(declaration.type);
	} else if (
		ts.isTypeParameterDeclaration(declaration) &&
		!ts.isInterfaceDeclaration(declaration.parent) &&
		!ts.isTypeAliasDeclaration(declaration.parent) &&
		!ts.isClassLike(declaration.parent) &&
		isGenericInScope(declaration, node, ctx)
	) {
		constraint =
			declaration.constraint === undefined
				? undefined
				: checker.getTypeFromTypeNode(declaration.constraint);
	} else {
		return false;
	}
	if (constraint === undefined || isNeverType(constraint, ts)) {
		return true;
	}
	return getReturnKind(constraint, ctx, () => true) === 'value';
}

/**
 * Collects the generics (component generics and type parameters) that the type node uses.
 * It also looks into type aliases, `extends` of interfaces, `typeof` queries, and properties of
 * indexed access types (e.g. `Props['value']`) declared in user code.
 * Use `isGenericInScope` to drop type parameters that are replaced by type arguments.
 *
 * Types can be recursive, so this uses Tarjan's algorithm: the nodes in a cycle share one result,
 * and each node is visited once.
 */
function collectGenerics(node: TS.Node, ctx: CheckContext): ReadonlySet<TS.Node> {
	const cached = ctx.genericsCache.get(node);
	if (cached !== undefined) {
		return cached;
	}
	const indexes = new Map<TS.Node, number>();
	const lowLinks = new Map<TS.Node, number>();
	const results = new Map<TS.Node, Set<TS.Node>>();
	const stack: TS.Node[] = [];
	const onStack = new Set<TS.Node>();

	// Iterative, because recursion can overflow the stack with large types.
	const frames: { node: TS.Node; children: TS.Node[]; next: number }[] = [];

	/** Starts visiting the node. */
	function enter(current: TS.Node): void {
		const index = indexes.size;
		indexes.set(current, index);
		lowLinks.set(current, index);
		stack.push(current);
		onStack.add(current);
		const { generics, children } = getGenericEdges(current, ctx);
		results.set(current, new Set(generics));
		frames.push({ node: current, children, next: 0 });
	}

	enter(node);
	while (frames.length > 0) {
		const frame = frames[frames.length - 1];
		const current = frame.node;
		const result = results.get(current)!;
		if (frame.next < frame.children.length) {
			const child = frame.children[frame.next++];
			const done = ctx.genericsCache.get(child);
			if (done !== undefined) {
				done.forEach((generic) => result.add(generic));
			} else if (!indexes.has(child)) {
				enter(child);
			} else if (onStack.has(child)) {
				lowLinks.set(current, Math.min(lowLinks.get(current)!, indexes.get(child)!));
			}
			continue;
		}
		frames.pop();
		if (lowLinks.get(current) === indexes.get(current)) {
			// `current` is the root of a cycle (or a single node): all nodes in it share the result.
			const shared = new Set<TS.Node>();
			const members: TS.Node[] = [];
			let member: TS.Node;
			do {
				member = stack.pop()!;
				onStack.delete(member);
				members.push(member);
				results.get(member)!.forEach((generic) => shared.add(generic));
			} while (member !== current);
			for (const m of members) {
				ctx.genericsCache.set(m, shared);
			}
		}
		const parent = frames[frames.length - 1];
		if (parent !== undefined) {
			// Merge the result of `current` into the parent, like after a recursive call.
			lowLinks.set(parent.node, Math.min(lowLinks.get(parent.node)!, lowLinks.get(current)!));
			const parentResult = results.get(parent.node)!;
			(ctx.genericsCache.get(current) ?? result).forEach((generic) => parentResult.add(generic));
		}
	}
	return ctx.genericsCache.get(node)!;
}

/**
 * Returns the generics that the node refers to directly, and the nodes to look into next.
 */
function getGenericEdges(
	node: TS.Node,
	ctx: CheckContext
): { generics: TS.Node[]; children: TS.Node[] } {
	const { ts } = ctx.tsTools;
	const program = ctx.tsTools.service.program;
	const checker = program.getTypeChecker();
	const generics: TS.Node[] = [];
	const children: TS.Node[] = [];

	// Type arguments and conditional checks need not contribute to the returned value.
	if (ts.isTypeNode(node) && isDefinitelyNoValue(node, ctx)) {
		return { generics, children };
	}

	/** Adds a type node in a declaration, if it is in user code. */
	function addDeclared(child: TS.Node | undefined): void {
		const sourceFile = child?.getSourceFile();
		if (
			child !== undefined &&
			sourceFile !== undefined &&
			!program.isSourceFileDefaultLibrary(sourceFile) &&
			!program.isSourceFileFromExternalLibrary(sourceFile)
		) {
			children.push(child);
		}
	}

	/** Returns the declarations of the symbol at the node, following imports. */
	function getDeclarations(target: TS.Node): TS.Declaration[] {
		let symbol = checker.getSymbolAtLocation(target);
		if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
			symbol = checker.getAliasedSymbol(symbol);
		}
		return symbol?.getDeclarations() ?? [];
	}

	/** Adds the generic or the declared type that the type reference refers to. */
	function addReference(target: TS.Node, followDeclarations: boolean): void {
		for (const declaration of getDeclarations(target)) {
			if (ctx.genericDeclarations.has(declaration) || ts.isTypeParameterDeclaration(declaration)) {
				generics.push(declaration);
			} else if (!followDeclarations) {
				continue;
			} else if (ts.isTypeAliasDeclaration(declaration)) {
				addDeclared(declaration.type);
			} else if (ts.isInterfaceDeclaration(declaration)) {
				declaration.heritageClauses?.forEach(addDeclared);
			}
		}
	}

	if (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node)) {
		addReference(ts.isTypeReferenceNode(node) ? node.typeName : node.expression, true);
	} else if (ts.isTypeQueryNode(node)) {
		for (const declaration of getDeclarations(node.exprName)) {
			if (
				ts.isVariableDeclaration(declaration) ||
				ts.isParameter(declaration) ||
				ts.isPropertySignature(declaration) ||
				ts.isPropertyDeclaration(declaration)
			) {
				addDeclared(declaration.type);
				if (ts.isVariableDeclaration(declaration) || ts.isPropertyDeclaration(declaration)) {
					if (declaration.type === undefined) addDeclared(declaration.initializer);
				}
			} else if (ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration)) {
				addDeclared(declaration.type ?? declaration.body);
			}
		}
	} else if (ts.isIndexedAccessTypeNode(node)) {
		// e.g. `Props['value']`: only the type of the property matters, not the other properties.
		const indexType = checker.getTypeFromTypeNode(node.indexType);
		const property =
			indexType.isStringLiteral() || indexType.isNumberLiteral()
				? checker.getPropertyOfType(
						checker.getTypeFromTypeNode(node.objectType),
						String(indexType.value)
					)
				: undefined;
		const propertyTypes = (property?.getDeclarations() ?? []).flatMap((declaration) =>
			ts.isPropertySignature(declaration) && declaration.type !== undefined
				? [declaration.type]
				: []
		);
		if (propertyTypes.length > 0) {
			propertyTypes.forEach(addDeclared);
			// The object type may be a generic (e.g. `R['value']`) or have generic type arguments
			// (e.g. `Row<T>['value']`).
			if (ts.isTypeReferenceNode(node.objectType)) {
				addReference(node.objectType.typeName, false);
				children.push(...(node.objectType.typeArguments ?? []));
			}
			return { generics, children };
		}
	}
	ts.forEachChild(node, (child) => {
		children.push(child);
	});
	return { generics, children };
}

/** Whether a type cannot produce a value, independently of component generic substitution. */
function isDefinitelyNoValue(node: TS.TypeNode, ctx: CheckContext): boolean {
	const { ts } = ctx.tsTools;
	const checker = ctx.tsTools.service.program.getTypeChecker();
	const pending = [node];
	const seen = new Set<TS.TypeNode>();
	while (pending.length > 0) {
		const current = pending.pop()!;
		if (seen.has(current)) continue;
		seen.add(current);
		if (ts.isConditionalTypeNode(current)) {
			pending.push(current.trueType, current.falseType);
			continue;
		}
		if (ts.isParenthesizedTypeNode(current)) {
			pending.push(current.type);
			continue;
		}
		if (ts.isUnionTypeNode(current)) {
			pending.push(...current.types);
			continue;
		}
		if (ts.isTypeQueryNode(current)) return false;
		if (ts.isIndexedAccessTypeNode(current)) {
			const index = checker.getTypeFromTypeNode(current.indexType);
			if (!index.isStringLiteral() && !index.isNumberLiteral()) return false;
			const property = checker.getPropertyOfType(
				checker.getTypeFromTypeNode(current.objectType),
				String(index.value)
			);
			const declarations = property?.getDeclarations() ?? [];
			if (declarations.length === 0) return false;
			for (const declaration of declarations) {
				if (!ts.isPropertySignature(declaration) || declaration.type === undefined) return false;
				pending.push(declaration.type);
			}
			continue;
		}
		if (ts.isTypeReferenceNode(current)) {
			let symbol = checker.getSymbolAtLocation(current.typeName);
			if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0)
				symbol = checker.getAliasedSymbol(symbol);
			const alias = symbol?.getDeclarations()?.find(ts.isTypeAliasDeclaration);
			if (alias && !ctx.genericDeclarations.has(alias)) {
				// Inspect the uninstantiated alias: a component generic may have selected only
				// the void branch of a conditional, even though another branch returns a value.
				pending.push(alias.type);
				continue;
			}
			// In particular, Promise<keyof T> must not lose T when keyof T becomes never.
			pending.push(...(current.typeArguments ?? []));
		}
		const type = checker.getTypeFromTypeNode(current);
		// `keyof T` can become never when the parser replaces T with unknown.
		if (isNeverType(type, ts) && current.kind !== ts.SyntaxKind.NeverKeyword) return false;
		if (getReturnKind(type, ctx, () => true) === 'value') return false;
	}
	return true;
}
