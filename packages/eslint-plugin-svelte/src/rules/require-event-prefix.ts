import { createRule } from '../utils/index.js';
import {
	type TSTools,
	getTypeScriptTools,
	isMethodSymbol,
	isPropertySignatureKind,
	isFunctionTypeKind,
	isNullType,
	isUndefinedType,
	isVoidType,
	getCallSignaturesOfType
} from '../utils/ts-utils/index.js';
import type * as TS from 'typescript';
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
		// The parser substitutes component generics with aliases, losing their provenance.
		const hasComponentGenerics = context.sourceCode.ast.body.some(
			(element) =>
				element.type === 'SvelteScriptElement' &&
				element.startTag.attributes.some(
					(attribute) => attribute.type === 'SvelteGenericsDirective'
				)
		);

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
						isEventLike(property, tsTools, checkAsyncFunctions, hasComponentGenerics)
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

/** Checks only return types that are known to produce no value. */
function isEventLike(
	functionSymbol: TS.Symbol,
	tsTools: TSTools,
	checkAsyncFunctions: boolean,
	hasComponentGenerics: boolean
): boolean {
	const declaration = functionSymbol.valueDeclaration ?? functionSymbol.getDeclarations()?.[0];
	if (declaration === undefined) return false;
	const checker = tsTools.service.program.getTypeChecker();
	const signatures = getCallSignaturesOfType(
		checker.getTypeOfSymbolAtLocation(functionSymbol, declaration)
	);
	if (signatures.length === 0) return false;
	const kinds = signatures.map((signature): ReturnKind => {
		// In generic components, aliases and derived types may have already lost value branches.
		// Only explicit no-value annotations are safe without reconstructing their provenance.
		if (hasComponentGenerics && !isExplicitNoValue(signature.getDeclaration()?.type, tsTools.ts)) {
			return 'other';
		}
		return getReturnKind(checker.getReturnTypeOfSignature(signature), tsTools);
	});
	return !kinds.includes('other') && (kinds.includes('void') || checkAsyncFunctions);
}

/** A deliberately small syntax check for generic components. */
function isExplicitNoValue(node: TS.TypeNode | undefined, ts: TSTools['ts']): boolean {
	if (!node) return false;
	if (ts.isParenthesizedTypeNode(node)) return isExplicitNoValue(node.type, ts);
	if (ts.isUnionTypeNode(node)) return node.types.every((part) => isExplicitNoValue(part, ts));
	if (ts.isTypeReferenceNode(node)) {
		return (
			ts.isIdentifier(node.typeName) &&
			['Promise', 'PromiseLike'].includes(node.typeName.text) &&
			node.typeArguments?.length === 1 &&
			isExplicitNoValue(node.typeArguments[0], ts)
		);
	}
	return (
		node.kind === ts.SyntaxKind.VoidKeyword ||
		node.kind === ts.SyntaxKind.UndefinedKeyword ||
		(ts.isLiteralTypeNode(node) && node.literal.kind === ts.SyntaxKind.NullKeyword)
	);
}

type ReturnKind = 'void' | 'async' | 'other';

function getReturnKind(type: TS.Type, tsTools: TSTools): ReturnKind {
	const { ts } = tsTools;
	const checker = tsTools.service.program.getTypeChecker();
	if (isVoidType(type, ts) || isUndefinedType(type, ts) || isNullType(type, ts)) {
		return 'void';
	}
	if (type.isUnion()) {
		const kinds = type.types.map((part) => getReturnKind(part, tsTools));
		if (kinds.includes('other')) return 'other';
		return kinds.includes('void') ? 'void' : 'async';
	}
	if (checker.getPropertyOfType(type, 'then') === undefined) return 'other';
	const awaitedType = checker.getAwaitedType(type);
	if (awaitedType === undefined || awaitedType === type) return 'other';
	return getReturnKind(awaitedType, tsTools) === 'other' ? 'other' : 'async';
}
