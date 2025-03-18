import { createRule } from '../utils/index.js';
import { type TSTools, getTypeScriptTools, isMethodSymbol } from '../utils/ts-utils/index.js';
import {
	type MethodSignature,
	type Symbol,
	SyntaxKind,
	type Type,
	type TypeReferenceNode,
	type PropertySignature
} from 'typescript';
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
						(checkAsyncFunctions || !isFunctionAsync(property))
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
		(functionSymbol.valueDeclaration?.kind === SyntaxKind.PropertySignature &&
			(functionSymbol.valueDeclaration as PropertySignature).type?.kind === SyntaxKind.FunctionType)
	);
}

function isFunctionAsync(functionSymbol: Symbol): boolean {
	return (
		functionSymbol.getDeclarations()?.some((declaration) => {
			if (declaration.kind !== SyntaxKind.MethodSignature) {
				return false;
			}
			const declarationType = (declaration as MethodSignature).type;
			if (declarationType?.kind !== SyntaxKind.TypeReference) {
				return false;
			}
			const declarationTypeName = (declarationType as TypeReferenceNode).typeName;
			return (
				declarationTypeName.kind === SyntaxKind.Identifier &&
				declarationTypeName.escapedText === 'Promise'
			);
		}) ?? false
	);
}
