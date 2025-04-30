import { createRule } from '../utils/index.js';
import {
	type TSTools,
	getTypeScriptTools,
	isMethodSymbol,
	isPropertySignatureKind,
	isFunctionTypeKind,
	isMethodSignatureKind,
	isTypeReferenceKind,
	isIdentifierKind
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
						(checkAsyncFunctions || !isFunctionAsync(property, tsTools))
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

function isFunctionAsync(functionSymbol: Symbol, tsTools: TSTools): boolean {
	return (
		functionSymbol.getDeclarations()?.some((declaration) => {
			if (!isMethodSignatureKind(declaration, tsTools.ts)) {
				return false;
			}
			if (declaration.type === undefined || !isTypeReferenceKind(declaration.type, tsTools.ts)) {
				return false;
			}
			return (
				isIdentifierKind(declaration.type.typeName, tsTools.ts) &&
				declaration.type.typeName.escapedText === 'Promise'
			);
		}) ?? false
	);
}
