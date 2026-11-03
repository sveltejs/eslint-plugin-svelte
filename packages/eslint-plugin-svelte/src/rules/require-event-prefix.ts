import { createRule } from '../utils/index.js';
import {
	type TSTools,
	getTypeScriptTools,
	isMethodSymbol,
	isPropertySignatureKind,
	isFunctionTypeKind,
	isAnyType,
	isUndefinedType,
	isUnknownType,
	isVoidType,
	getCallSignaturesOfType
} from '../utils/ts-utils/index.js';
import type { Symbol, Type, TypeNode } from 'typescript';
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
						isEventLike(property, tsTools, checkAsyncFunctions)
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

function getPropsType(node: CallExpression, tsTools: TSTools): Type | undefined {
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

function isFunctionLike(functionSymbol: Symbol, tsTools: TSTools): boolean {
	return (
		isMethodSymbol(functionSymbol, tsTools.ts) ||
		(functionSymbol.valueDeclaration !== undefined &&
			isPropertySignatureKind(functionSymbol.valueDeclaration, tsTools.ts) &&
			functionSymbol.valueDeclaration.type !== undefined &&
			isFunctionTypeKind(functionSymbol.valueDeclaration.type, tsTools.ts))
	);
}

/**
 * Checks whether the function looks like an event handler, based on its return type.
 * - `void` / `undefined` (and unions such as `void | Promise<void>`): event.
 * - `any` / `unknown` written as a keyword: event, because we cannot tell.
 *   A type that only resolves to `unknown` (e.g. an unconstrained generic `T`) is a value.
 * - Promise-like of the above (e.g. `Promise<void>`): event only when `checkAsyncFunctions` is enabled.
 * - Anything else (e.g. `getHref: (item: T) => string`): not an event.
 */
function isEventLike(
	functionSymbol: Symbol,
	tsTools: TSTools,
	checkAsyncFunctions: boolean
): boolean {
	const declaration = functionSymbol.valueDeclaration ?? functionSymbol.getDeclarations()?.[0];
	if (declaration === undefined) {
		return true;
	}
	const checker = tsTools.service.program.getTypeChecker();
	const signatures = getCallSignaturesOfType(
		checker.getTypeOfSymbolAtLocation(functionSymbol, declaration)
	);
	if (signatures.length === 0) {
		return true;
	}
	return signatures.every((signature) => {
		const kind = getReturnKind(
			checker.getReturnTypeOfSignature(signature),
			signature.getDeclaration()?.type,
			tsTools
		);
		return kind === 'void' || (kind === 'async' && checkAsyncFunctions);
	});
}

type ReturnKind = 'void' | 'async' | 'value';

function getReturnKind(type: Type, typeNode: TypeNode | undefined, tsTools: TSTools): ReturnKind {
	const { ts } = tsTools;
	if (isVoidType(type, ts) || isUndefinedType(type, ts)) {
		return 'void';
	}
	if (isAnyType(type, ts) || isUnknownType(type, ts)) {
		return isAnyOrUnknownKeyword(typeNode, tsTools) ? 'void' : 'value';
	}
	if (type.isUnion()) {
		// Union members are never `any` / `unknown`, so we don't need their type nodes.
		const kinds = type.types.map((t) => getReturnKind(t, undefined, tsTools));
		if (kinds.includes('value')) {
			return 'value';
		}
		// e.g. `void | Promise<void>` may return synchronously, so it is treated like `void`.
		return kinds.includes('void') ? 'void' : 'async';
	}
	const checker = tsTools.service.program.getTypeChecker();
	if (checker.getPropertyOfType(checker.getApparentType(type), 'then') === undefined) {
		return 'value';
	}
	const awaitedType = checker.getAwaitedType(type);
	if (awaitedType === undefined || awaitedType === type) {
		return 'value';
	}
	const awaitedTypeNode =
		typeNode !== undefined && ts.isTypeReferenceNode(typeNode)
			? typeNode.typeArguments?.[0]
			: undefined;
	return getReturnKind(awaitedType, awaitedTypeNode, tsTools) === 'value' ? 'value' : 'async';
}

/**
 * Returns `true` if the type node is `any` / `unknown` written as a keyword, or if there is no type node.
 */
function isAnyOrUnknownKeyword(typeNode: TypeNode | undefined, tsTools: TSTools): boolean {
	const { ts } = tsTools;
	let node = typeNode;
	while (node !== undefined && ts.isParenthesizedTypeNode(node)) {
		node = node.type;
	}
	return (
		node === undefined ||
		node.kind === ts.SyntaxKind.AnyKeyword ||
		node.kind === ts.SyntaxKind.UnknownKeyword
	);
}
