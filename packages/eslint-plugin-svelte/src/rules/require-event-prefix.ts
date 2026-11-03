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
import type { Symbol, Type } from 'typescript';
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
 * Checks whether the function returns nothing (`void` or `undefined`).
 * `any` and `unknown` are also treated as events because we cannot tell.
 * Functions that return a value (e.g. `getHref: (item: T) => string`) are not events.
 * `Promise<void>` is treated as an event only when `checkAsyncFunctions` is enabled.
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
		const returnType = checker.getReturnTypeOfSignature(signature);
		if (isVoidOrUnknownType(returnType, tsTools)) {
			return true;
		}
		if (returnType.getSymbol()?.getName() === 'Promise') {
			const awaitedType = checker.getAwaitedType(returnType);
			return (
				checkAsyncFunctions &&
				awaitedType !== undefined &&
				isVoidOrUnknownType(awaitedType, tsTools)
			);
		}
		return false;
	});
}

function isVoidOrUnknownType(type: Type, tsTools: TSTools): boolean {
	if (type.isUnion()) {
		return type.types.every((t) => isVoidOrUnknownType(t, tsTools));
	}
	return (
		isVoidType(type, tsTools.ts) ||
		isUndefinedType(type, tsTools.ts) ||
		isAnyType(type, tsTools.ts) ||
		isUnknownType(type, tsTools.ts)
	);
}
