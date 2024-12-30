import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import {
	isClosingBracketToken,
	isClosingParenToken,
	isNotClosingParenToken,
	isNotOpeningBraceToken,
	isOpeningBraceToken,
	isOpeningBracketToken,
	isOpeningParenToken,
	isSemicolonToken
} from '@eslint-community/eslint-utils';
import type { AnyToken, IndentContext } from './commons.js';
import { isBeginningOfLine } from './commons.js';
import { getFirstAndLastTokens } from './commons.js';
import type { TSNodeListener } from '../../types-for-node.js';

type NodeListener = TSNodeListener;

/**
 * Creates AST event handlers for svelte nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener {
	const { offsets, sourceCode } = context;
	const visitor = {
		TSTypeAnnotation(node: TSESTree.TSTypeAnnotation) {
			// : Type
			// => Type
			const [colonOrArrowToken, secondToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			const baseToken = sourceCode.getFirstToken(node.parent);
			offsets.setOffsetToken([colonOrArrowToken, secondToken], 1, baseToken);

			const before = sourceCode.getTokenBefore(colonOrArrowToken);
			if (before && before.value === '?') {
				offsets.setOffsetToken(before, 1, baseToken);
			}
		},
		TSAsExpression(node: TSESTree.TSAsExpression | TSESTree.TSSatisfiesExpression) {
			// foo as T
			// or
			// foo satisfies T
			const expressionTokens = getFirstAndLastTokens(sourceCode, node.expression);
			const asOrSatisfiesToken = sourceCode.getTokenAfter(expressionTokens.lastToken)!;
			offsets.setOffsetToken(
				[asOrSatisfiesToken, getFirstAndLastTokens(sourceCode, node.typeAnnotation).firstToken],
				1,
				expressionTokens.firstToken
			);
		},
		TSSatisfiesExpression(node: TSESTree.TSSatisfiesExpression) {
			// foo satisfies T
			visitor.TSAsExpression(node);
		},
		TSTypeReference(node: TSESTree.TSTypeReference | TSESTree.TSInstantiationExpression) {
			// T<U>
			// or
			// const ErrorMap = Map<string, Error>
			//                  ^^^^^^^^^^^^^^^^^^
			const typeArguments =
				node.typeArguments ??
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
				(node as any).typeParameters;
			if (typeArguments) {
				const firstToken = sourceCode.getFirstToken(node);
				offsets.setOffsetToken(sourceCode.getFirstToken(typeArguments), 1, firstToken);
			}
		},
		TSInstantiationExpression(node: TSESTree.TSInstantiationExpression) {
			// const ErrorMap = Map<string, Error>
			//                  ^^^^^^^^^^^^^^^^^^
			visitor.TSTypeReference(node);
		},
		TSTypeParameterInstantiation(
			node: TSESTree.TSTypeParameterInstantiation | TSESTree.TSTypeParameterDeclaration
		) {
			// <T>
			offsets.setOffsetElementList(
				node.params,
				sourceCode.getFirstToken(node),
				sourceCode.getLastToken(node),
				1
			);
		},
		TSTypeParameterDeclaration(node: TSESTree.TSTypeParameterDeclaration) {
			// <T>
			visitor.TSTypeParameterInstantiation(node);
		},
		TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
			// type T = {}
			const typeToken = sourceCode.getFirstToken(node);
			const idToken = sourceCode.getFirstToken(node.id);
			offsets.setOffsetToken(idToken, 1, typeToken);

			let eqToken: AST.Token | null;
			if (node.typeParameters) {
				offsets.setOffsetToken(sourceCode.getFirstToken(node.typeParameters), 1, idToken);
				eqToken = sourceCode.getTokenAfter(node.typeParameters)!;
			} else {
				eqToken = sourceCode.getTokenAfter(node.id)!;
			}

			const initToken = sourceCode.getTokenAfter(eqToken);

			offsets.setOffsetToken([eqToken, initToken], 1, idToken);
		},
		TSFunctionType(node: TSESTree.TSFunctionType | TSESTree.TSConstructorType) {
			// ()=>void
			const firstToken = sourceCode.getFirstToken(node);
			// new or < or (
			let currToken = firstToken;
			if (node.type === 'TSConstructorType') {
				// currToken is new token
				// < or (
				currToken = sourceCode.getTokenAfter(currToken)!;
				offsets.setOffsetToken(currToken, 1, firstToken);
			}
			if (node.typeParameters) {
				// currToken is < token
				// (
				currToken = sourceCode.getTokenAfter(node.typeParameters)!;
				offsets.setOffsetToken(currToken, 1, firstToken);
			}
			const leftParenToken = currToken;
			const rightParenToken = sourceCode.getTokenAfter(
				node.params[node.params.length - 1] || leftParenToken,
				{ filter: isClosingParenToken, includeComments: false }
			)!;
			offsets.setOffsetElementList(node.params, leftParenToken, rightParenToken, 1);

			const arrowToken = sourceCode.getTokenAfter(rightParenToken);
			offsets.setOffsetToken(arrowToken, 1, leftParenToken);
		},
		TSConstructorType(node: TSESTree.TSConstructorType) {
			// new ()=>void
			visitor.TSFunctionType(node);
		},
		TSTypeLiteral(node: TSESTree.TSTypeLiteral) {
			// {foo:any}
			offsets.setOffsetElementList(
				node.members,
				sourceCode.getFirstToken(node),
				sourceCode.getLastToken(node),
				1
			);
		},
		TSPropertySignature(node: TSESTree.TSPropertySignature) {
			// { target:any }
			//   ^^^^^^^^^^
			const firstToken = sourceCode.getFirstToken(node);
			const keyTokens = getFirstAndLastTokens(sourceCode, node.key);
			let keyLast;
			if (node.computed) {
				const closeBracket = sourceCode.getTokenAfter(keyTokens.lastToken)!;
				offsets.setOffsetElementList([node.key], firstToken, closeBracket, 1);
				keyLast = closeBracket;
			} else {
				keyLast = keyTokens.lastToken;
			}
			if (node.typeAnnotation) {
				const typeAnnotationToken = sourceCode.getFirstToken(node.typeAnnotation);
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(keyLast, typeAnnotationToken), typeAnnotationToken],
					1,
					firstToken
				);
			} else if (node.optional) {
				const qToken = sourceCode.getLastToken(node);
				offsets.setOffsetToken(qToken, 1, firstToken);
			}
		},
		TSIndexSignature(node: TSESTree.TSIndexSignature) {
			// { [k: string ]: string[] };
			//   ^^^^^^^^^^^^^^^^^^^^^^
			const leftBracketToken = sourceCode.getFirstToken(node);
			const rightBracketToken = sourceCode.getTokenAfter(
				node.parameters[node.parameters.length - 1] || leftBracketToken,
				{ filter: isClosingBracketToken, includeComments: false }
			)!;
			offsets.setOffsetElementList(node.parameters, leftBracketToken, rightBracketToken, 1);
			const keyLast = rightBracketToken;
			if (node.typeAnnotation) {
				const typeAnnotationToken = sourceCode.getFirstToken(node.typeAnnotation);
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(keyLast, typeAnnotationToken), typeAnnotationToken],
					1,
					leftBracketToken
				);
			}
		},
		TSArrayType(node: TSESTree.TSArrayType) {
			// T[]
			const firstToken = sourceCode.getFirstToken(node);
			offsets.setOffsetToken(
				sourceCode.getLastTokens(node, { count: 2, includeComments: false }),
				0,
				firstToken
			);
		},
		TSTupleType(node: TSESTree.TSTupleType) {
			// [T, U]
			offsets.setOffsetElementList(
				node.elementTypes,
				sourceCode.getFirstToken(node),
				sourceCode.getLastToken(node),
				1
			);
		},
		TSQualifiedName(node: TSESTree.TSQualifiedName) {
			// A.B
			const objectToken = sourceCode.getFirstToken(node);
			const dotToken = sourceCode.getTokenBefore(node.right)!;
			const propertyToken = sourceCode.getTokenAfter(dotToken);

			offsets.setOffsetToken([dotToken, propertyToken], 1, objectToken);
		},
		TSIndexedAccessType(node: TSESTree.TSIndexedAccessType) {
			// A[B]
			const objectToken = sourceCode.getFirstToken(node);

			const leftBracketToken = sourceCode.getTokenBefore(node.indexType, {
				filter: isOpeningBracketToken,
				includeComments: false
			})!;
			const rightBracketToken = sourceCode.getTokenAfter(node.indexType, {
				filter: isClosingBracketToken,
				includeComments: false
			});

			offsets.setOffsetToken(leftBracketToken, 1, objectToken);
			offsets.setOffsetElementList([node.indexType], leftBracketToken, rightBracketToken, 1);
		},
		TSUnionType(node: TSESTree.TSUnionType | TSESTree.TSIntersectionType) {
			// A | B
			const firstToken = sourceCode.getFirstToken(node);
			const types = [...node.types];
			if (getFirstAndLastTokens(sourceCode, types[0]).firstToken === firstToken) {
				types.shift();
			}
			offsets.setOffsetElementList(
				types,
				firstToken,
				null,
				isBeginningOfLine(sourceCode, firstToken) ? 0 : 1
			);
		},
		TSIntersectionType(node: TSESTree.TSIntersectionType) {
			// A & B
			visitor.TSUnionType(node);
		},
		TSMappedType(node: TSESTree.TSMappedType) {
			// {[key in foo]: bar}
			const leftBraceToken = sourceCode.getFirstToken(node);

			const leftBracketToken = sourceCode.getTokenBefore(node.key || node.typeParameter)!;
			const rightBracketToken = sourceCode.getTokenAfter(
				node.nameType || node.constraint || node.typeParameter
			)!;
			offsets.setOffsetToken(
				[...sourceCode.getTokensBetween(leftBraceToken, leftBracketToken), leftBracketToken],
				1,
				leftBraceToken
			);
			offsets.setOffsetElementList(
				[node.key, node.constraint, node.typeParameter, node.nameType],
				leftBracketToken,
				rightBracketToken,
				1
			);

			if (node.key && node.constraint) {
				const firstToken = sourceCode.getFirstToken(node.key);
				offsets.setOffsetToken(
					[
						...sourceCode.getTokensBetween(firstToken, node.constraint),
						sourceCode.getFirstToken(node.constraint)
					],
					1,
					firstToken
				);
			}

			const rightBraceToken = sourceCode.getLastToken(node);
			if (node.typeAnnotation) {
				const typeAnnotationToken = sourceCode.getFirstToken(node.typeAnnotation);
				offsets.setOffsetToken(
					[
						...sourceCode.getTokensBetween(rightBracketToken, typeAnnotationToken),
						typeAnnotationToken
					],
					1,
					leftBraceToken
				);
			} else {
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(rightBracketToken, rightBraceToken)],
					1,
					leftBraceToken
				);
			}

			offsets.setOffsetToken(rightBraceToken, 0, leftBraceToken);
		},
		TSTypeParameter(node: TSESTree.TSTypeParameter) {
			// {[key in foo]: bar}
			//   ^^^^^^^^^^
			// type T<U extends V = W>
			//        ^^^^^^^^^^^^^^^
			const [firstToken, ...afterTokens] = sourceCode.getTokens(node);

			for (const child of [node.constraint, node.default]) {
				if (!child) {
					continue;
				}
				const [, ...removeTokens] = sourceCode.getTokens(child);
				for (const token of removeTokens) {
					const i = afterTokens.indexOf(token);
					if (i >= 0) {
						afterTokens.splice(i, 1);
					}
				}
			}
			const secondToken = afterTokens.shift();
			if (!secondToken) {
				return;
			}
			offsets.setOffsetToken(secondToken, 1, firstToken);

			if (secondToken.value === 'extends') {
				let prevToken: AnyToken | null = null;
				let token = afterTokens.shift();
				while (token) {
					if (token.value === '=') {
						break;
					}
					offsets.setOffsetToken(token, 1, secondToken);
					prevToken = token;
					token = afterTokens.shift();
				}
				while (token) {
					offsets.setOffsetToken(token, 1, prevToken || secondToken);
					token = afterTokens.shift();
				}
			} else {
				offsets.setOffsetToken(afterTokens, 1, firstToken);
			}
		},
		TSConditionalType(node: TSESTree.TSConditionalType) {
			// T extends Foo ? T : U
			const checkTypeToken = sourceCode.getFirstToken(node);
			const extendsToken = sourceCode.getTokenAfter(node.checkType)!;
			const extendsTypeToken = sourceCode.getFirstToken(node.extendsType);

			offsets.setOffsetToken(extendsToken, 1, checkTypeToken);
			offsets.setOffsetToken(extendsTypeToken, 1, extendsToken);

			const questionToken = sourceCode.getTokenAfter(node.extendsType, {
				filter: isNotClosingParenToken,
				includeComments: false
			})!;

			const consequentToken = sourceCode.getTokenAfter(questionToken);
			const colonToken = sourceCode.getTokenAfter(node.trueType, {
				filter: isNotClosingParenToken,
				includeComments: false
			})!;
			const alternateToken = sourceCode.getTokenAfter(colonToken);

			let baseNode = node;
			let parent = baseNode.parent;
			while (parent && parent.type === 'TSConditionalType' && parent.falseType === baseNode) {
				baseNode = parent;
				parent = baseNode.parent;
			}
			const baseToken = sourceCode.getFirstToken(baseNode);

			offsets.setOffsetToken([questionToken, colonToken], 1, baseToken);
			offsets.setOffsetToken(consequentToken, 1, questionToken);
			offsets.setOffsetToken(alternateToken, 1, colonToken);
		},
		TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
			// interface I {}
			const interfaceToken = sourceCode.getFirstToken(node);
			offsets.setOffsetToken(sourceCode.getFirstToken(node.id), 1, interfaceToken);
			if (node.typeParameters != null) {
				offsets.setOffsetToken(
					sourceCode.getFirstToken(node.typeParameters),
					1,
					sourceCode.getFirstToken(node.id)
				);
			}
			if (node.extends != null && node.extends.length) {
				const extendsToken = sourceCode.getTokenBefore(node.extends[0])!;
				offsets.setOffsetToken(extendsToken, 1, interfaceToken);
				offsets.setOffsetElementList(node.extends, extendsToken, null, 1);
			}
			// It may not calculate the correct location because the visitor key is not provided.
			// if (node.implements != null && node.implements.length) {
			//   const implementsToken = sourceCode.getTokenBefore(node.implements[0])!
			//  offsets.setOffsetToken(implementsToken, 1, interfaceToken)
			//  offsets.setOffsetElementList( node.implements, implementsToken, null, 1)
			// }
			const bodyToken = sourceCode.getFirstToken(node.body);
			offsets.setOffsetToken(bodyToken, 0, interfaceToken);
		},
		TSInterfaceBody(node: TSESTree.TSInterfaceBody | TSESTree.TSModuleBlock) {
			offsets.setOffsetElementList(
				node.body,
				sourceCode.getFirstToken(node),
				sourceCode.getLastToken(node),
				1
			);
		},
		TSClassImplements(node: TSESTree.TSClassImplements | TSESTree.TSInterfaceHeritage) {
			// class C implements T {}
			//                    ^
			const typeArguments =
				node.typeArguments ??
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
				(node as any).typeParameters;
			if (typeArguments) {
				offsets.setOffsetToken(
					sourceCode.getFirstToken(typeArguments),
					1,
					sourceCode.getFirstToken(node)
				);
			}
		},
		TSInterfaceHeritage(node: TSESTree.TSInterfaceHeritage) {
			// interface I extends E implements T {}
			//                     ^            ^
			visitor.TSClassImplements(node);
		},
		TSEnumDeclaration(node: TSESTree.TSEnumDeclaration) {
			// enum E {}
			const firstToken = sourceCode.getFirstToken(node);
			const idTokens = getFirstAndLastTokens(sourceCode, node.id);
			const prefixTokens = sourceCode.getTokensBetween(firstToken, idTokens.firstToken);
			offsets.setOffsetToken(prefixTokens, 0, firstToken);
			offsets.setOffsetToken(idTokens.firstToken, 1, firstToken);

			const leftBraceToken = sourceCode.getTokenAfter(idTokens.lastToken)!;
			const rightBraceToken = sourceCode.getLastToken(node);
			offsets.setOffsetToken(leftBraceToken, 0, firstToken);
			if (node.members)
				offsets.setOffsetElementList(node.members, leftBraceToken, rightBraceToken, 1);
		},
		TSEnumBody(node: TSESTree.TSEnumBody) {
			// enum E {...}
			//        ^^^^^
			const leftBraceToken = sourceCode.getFirstToken(node);
			const rightBraceToken = sourceCode.getLastToken(node);
			offsets.setOffsetElementList(node.members, leftBraceToken, rightBraceToken, 1);
		},
		TSModuleDeclaration(node: TSESTree.TSModuleDeclaration) {
			const firstToken = sourceCode.getFirstToken(node);
			const idTokens = getFirstAndLastTokens(sourceCode, node.id);
			const prefixTokens = sourceCode.getTokensBetween(firstToken, idTokens.firstToken);
			offsets.setOffsetToken(prefixTokens, 0, firstToken);
			offsets.setOffsetToken(idTokens.firstToken, 1, firstToken);

			if (node.body) {
				const bodyFirstToken = sourceCode.getFirstToken(node.body);
				offsets.setOffsetToken(
					bodyFirstToken,
					isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
					firstToken
				);
			}
		},
		TSModuleBlock(node: TSESTree.TSModuleBlock) {
			visitor.TSInterfaceBody(node);
		},
		TSMethodSignature(node: TSESTree.TSMethodSignature) {
			// fn(arg: A): R | null;
			const firstToken = sourceCode.getFirstToken(node);
			const keyTokens = getFirstAndLastTokens(sourceCode, node.key);
			let keyLast: AST.Token;
			if (node.computed) {
				const closeBracket = sourceCode.getTokenAfter(keyTokens.lastToken)!;
				offsets.setOffsetElementList([node.key], firstToken, closeBracket, 1);
				keyLast = closeBracket;
			} else {
				keyLast = keyTokens.lastToken;
			}
			const leftParenToken = sourceCode.getTokenAfter(keyLast, {
				filter: isOpeningParenToken,
				includeComments: false
			})!;
			offsets.setOffsetToken(
				[...sourceCode.getTokensBetween(keyLast, leftParenToken), leftParenToken],
				1,
				firstToken
			);
			const rightParenToken = sourceCode.getTokenAfter(
				node.params[node.params.length - 1] || leftParenToken,
				{ filter: isClosingParenToken, includeComments: false }
			)!;
			offsets.setOffsetElementList(node.params, leftParenToken, rightParenToken, 1);
			if (node.returnType) {
				const typeAnnotationToken = sourceCode.getFirstToken(node.returnType);
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(keyLast, typeAnnotationToken), typeAnnotationToken],
					1,
					firstToken
				);
			}
		},
		TSCallSignatureDeclaration(
			node: TSESTree.TSCallSignatureDeclaration | TSESTree.TSConstructSignatureDeclaration
		) {
			// interface A { <T> (e: E): R }
			//               ^^^^^^^^^^^^^
			const firstToken = sourceCode.getFirstToken(node);
			// new or < or (
			let currToken = firstToken;
			if (node.type === 'TSConstructSignatureDeclaration') {
				// currToken is new token
				// < or (
				currToken = sourceCode.getTokenAfter(currToken)!;
				offsets.setOffsetToken(currToken, 1, firstToken);
			}
			if (node.typeParameters) {
				// currToken is < token
				// (
				currToken = sourceCode.getTokenAfter(node.typeParameters)!;
				offsets.setOffsetToken(currToken, 1, firstToken);
			}
			const leftParenToken = currToken;
			const rightParenToken = sourceCode.getTokenAfter(
				node.params[node.params.length - 1] || leftParenToken,
				{ filter: isClosingParenToken, includeComments: false }
			)!;
			offsets.setOffsetElementList(node.params, leftParenToken, rightParenToken, 1);

			if (node.returnType) {
				const typeAnnotationToken = sourceCode.getFirstToken(node.returnType);
				offsets.setOffsetToken(
					[
						...sourceCode.getTokensBetween(rightParenToken, typeAnnotationToken),
						typeAnnotationToken
					],
					1,
					firstToken
				);
			}
		},
		TSConstructSignatureDeclaration(node: TSESTree.TSConstructSignatureDeclaration) {
			// interface A { new <T> (e: E): R }
			//               ^^^^^^^^^^^^^^^^^
			visitor.TSCallSignatureDeclaration(node);
		},
		TSEmptyBodyFunctionExpression(
			node: TSESTree.TSEmptyBodyFunctionExpression | TSESTree.TSDeclareFunction
		) {
			const firstToken = sourceCode.getFirstToken(node);
			let leftParenToken: AST.Token, bodyBaseToken: AST.Token;
			if (firstToken.type === 'Punctuator') {
				// method
				leftParenToken = firstToken;
				bodyBaseToken = sourceCode.getFirstToken(node.parent);
			} else {
				let nextToken = sourceCode.getTokenAfter(firstToken);
				let nextTokenOffset = 0;
				while (nextToken && !isOpeningParenToken(nextToken) && nextToken.value !== '<') {
					if (nextToken.value === '*' || (node.id && nextToken.range[0] === node.id.range[0])) {
						nextTokenOffset = 1;
					}
					offsets.setOffsetToken(nextToken, nextTokenOffset, firstToken);
					nextToken = sourceCode.getTokenAfter(nextToken);
				}

				leftParenToken = nextToken!;
				bodyBaseToken = firstToken;
			}

			if (!isOpeningParenToken(leftParenToken) && node.typeParameters) {
				leftParenToken = sourceCode.getTokenAfter(node.typeParameters)!;
			}

			const rightParenToken = sourceCode.getTokenAfter(
				node.params[node.params.length - 1] || leftParenToken,
				{ filter: isClosingParenToken, includeComments: false }
			)!;

			offsets.setOffsetToken(leftParenToken, 1, bodyBaseToken);
			offsets.setOffsetElementList(node.params, leftParenToken, rightParenToken, 1);
		},
		TSDeclareFunction(node: TSESTree.TSDeclareFunction) {
			// function fn(): void;
			visitor.TSEmptyBodyFunctionExpression(node);
		},
		TSTypeOperator(node: TSESTree.TSTypeOperator | TSESTree.TSTypeQuery | TSESTree.TSInferType) {
			// keyof T
			const firstToken = sourceCode.getFirstToken(node);
			const nextToken = sourceCode.getTokenAfter(firstToken);

			offsets.setOffsetToken(nextToken, 1, firstToken);
		},
		TSTypeQuery(node: TSESTree.TSTypeQuery) {
			// type T = typeof a
			visitor.TSTypeOperator(node);
		},
		TSInferType(node: TSESTree.TSInferType) {
			// infer U
			visitor.TSTypeOperator(node);
		},
		TSTypePredicate(node: TSESTree.TSTypePredicate) {
			// v is T
			const firstToken = sourceCode.getFirstToken(node);
			const opToken = sourceCode.getTokenAfter(node.parameterName, {
				filter: isNotClosingParenToken,
				includeComments: false
			})!;
			const rightToken =
				node.typeAnnotation && getFirstAndLastTokens(sourceCode, node.typeAnnotation).firstToken;

			offsets.setOffsetToken(
				[opToken, rightToken],
				1,
				getFirstAndLastTokens(sourceCode, firstToken).firstToken
			);
		},
		TSAbstractMethodDefinition(
			node:
				| TSESTree.TSAbstractMethodDefinition
				| TSESTree.TSAbstractPropertyDefinition
				| TSESTree.TSAbstractAccessorProperty
				| TSESTree.TSEnumMember
		) {
			const { keyNode, valueNode } =
				node.type === 'TSEnumMember'
					? { keyNode: node.id, valueNode: node.initializer }
					: { keyNode: node.key, valueNode: node.value };

			const firstToken = sourceCode.getFirstToken(node);
			const keyTokens = getFirstAndLastTokens(sourceCode, keyNode);
			const prefixTokens = sourceCode.getTokensBetween(firstToken, keyTokens.firstToken);
			if (node.computed) {
				prefixTokens.pop(); // pop [
			}
			offsets.setOffsetToken(prefixTokens, 0, firstToken);

			let lastKeyToken: AST.Token;
			if (node.computed) {
				const leftBracketToken = sourceCode.getTokenBefore(keyTokens.firstToken)!;
				const rightBracketToken = (lastKeyToken = sourceCode.getTokenAfter(keyTokens.lastToken)!);
				offsets.setOffsetToken(leftBracketToken, 0, firstToken);
				offsets.setOffsetElementList([keyNode], leftBracketToken, rightBracketToken, 1);
			} else {
				offsets.setOffsetToken(keyTokens.firstToken, 0, firstToken);
				lastKeyToken = keyTokens.lastToken;
			}

			if (valueNode != null) {
				const initToken = sourceCode.getFirstToken(valueNode);
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(lastKeyToken, initToken), initToken],
					1,
					lastKeyToken
				);
			}
		},
		TSAbstractPropertyDefinition(node: TSESTree.TSAbstractPropertyDefinition) {
			visitor.TSAbstractMethodDefinition(node);
		},
		TSEnumMember(node: TSESTree.TSEnumMember) {
			visitor.TSAbstractMethodDefinition(node);
		},
		TSAbstractAccessorProperty(node: TSESTree.TSAbstractAccessorProperty) {
			visitor.TSAbstractMethodDefinition(node);
		},
		TSOptionalType(node: TSESTree.TSOptionalType | TSESTree.TSNonNullExpression) {
			// [number?]
			//  ^^^^^^^
			offsets.setOffsetToken(sourceCode.getLastToken(node), 1, sourceCode.getFirstToken(node));
		},
		TSNonNullExpression(node: TSESTree.TSNonNullExpression) {
			// v!
			visitor.TSOptionalType(node);
		},
		TSJSDocNonNullableType(
			// @ts-expect-error -- Missing TSJSDocNonNullableType type
			node: TSESTree.TSJSDocNonNullableType
		) {
			// T!
			visitor.TSOptionalType(node);
		},
		TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
			// <const>
			const firstToken = sourceCode.getFirstToken(node);
			const expressionToken = getFirstAndLastTokens(sourceCode, node.expression).firstToken;
			offsets.setOffsetElementList(
				[node.typeAnnotation],
				firstToken,
				sourceCode.getTokenBefore(expressionToken),
				1
			);
			offsets.setOffsetToken(expressionToken, 1, firstToken);
		},
		TSImportType(node: TSESTree.TSImportType) {
			// import('foo').B
			const typeArguments =
				node.typeArguments ??
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
				(node as any).typeParameters;
			const firstToken = sourceCode.getFirstToken(node);
			const leftParenToken = sourceCode.getTokenAfter(firstToken, {
				filter: isOpeningParenToken,
				includeComments: false
			})!;
			offsets.setOffsetToken(leftParenToken, 1, firstToken);
			const argument =
				node.argument ||
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- typescript-eslint<v6 node
				(node as any).parameter;
			const rightParenToken = sourceCode.getTokenAfter(argument, {
				filter: isClosingParenToken,
				includeComments: false
			})!;
			offsets.setOffsetElementList([argument], leftParenToken, rightParenToken, 1);
			if (node.qualifier) {
				const dotToken = sourceCode.getTokenBefore(node.qualifier)!;
				const propertyToken = sourceCode.getTokenAfter(dotToken);
				offsets.setOffsetToken([dotToken, propertyToken], 1, firstToken);
			}
			if (typeArguments) {
				offsets.setOffsetToken(sourceCode.getFirstToken(typeArguments), 1, firstToken);
			}
		},
		TSParameterProperty(node: TSESTree.TSParameterProperty) {
			// constructor(private a)
			const firstToken = sourceCode.getFirstToken(node);
			const parameterToken = sourceCode.getFirstToken(node.parameter);
			offsets.setOffsetToken(
				[...sourceCode.getTokensBetween(firstToken, parameterToken), parameterToken],
				1,
				firstToken
			);
		},
		TSImportEqualsDeclaration(node: TSESTree.TSImportEqualsDeclaration) {
			// import foo = require('foo')
			const importToken = sourceCode.getFirstToken(node);
			const idTokens = getFirstAndLastTokens(sourceCode, node.id);
			offsets.setOffsetToken(idTokens.firstToken, 1, importToken);

			const opToken = sourceCode.getTokenAfter(idTokens.lastToken);

			offsets.setOffsetToken(
				[opToken, sourceCode.getFirstToken(node.moduleReference)],
				1,
				idTokens.lastToken
			);
		},
		TSExternalModuleReference(node: TSESTree.TSExternalModuleReference) {
			// require('foo')
			const requireToken = sourceCode.getFirstToken(node);
			const leftParenToken = sourceCode.getTokenAfter(requireToken, {
				filter: isOpeningParenToken,
				includeComments: false
			})!;
			const rightParenToken = sourceCode.getLastToken(node);

			offsets.setOffsetToken(leftParenToken, 1, requireToken);
			offsets.setOffsetElementList([node.expression], leftParenToken, rightParenToken, 1);
		},
		TSExportAssignment(node: TSESTree.TSExportAssignment) {
			// export = foo
			const exportNode = sourceCode.getFirstToken(node);
			const exprTokens = getFirstAndLastTokens(sourceCode, node.expression);
			const opToken = sourceCode.getTokenBefore(exprTokens.firstToken);

			offsets.setOffsetToken([opToken, exprTokens.firstToken], 1, exportNode);
		},
		TSNamedTupleMember(node: TSESTree.TSNamedTupleMember) {
			// [a: string, ...b: string[]]
			//  ^^^^^^^^^
			const labelToken = sourceCode.getFirstToken(node);
			const elementTokens = getFirstAndLastTokens(sourceCode, node.elementType);
			offsets.setOffsetToken(
				[
					...sourceCode.getTokensBetween(labelToken, elementTokens.firstToken),
					elementTokens.firstToken
				],
				1,
				labelToken
			);
		},
		TSRestType(node: TSESTree.TSRestType) {
			// [a: string, ...b: string[]]
			//             ^^^^^^^^^^^^^^
			const firstToken = sourceCode.getFirstToken(node);
			const nextToken = sourceCode.getTokenAfter(firstToken);

			offsets.setOffsetToken(nextToken, 1, firstToken);
		},
		TSNamespaceExportDeclaration(node: TSESTree.TSNamespaceExportDeclaration) {
			const firstToken = sourceCode.getFirstToken(node);
			const idToken = sourceCode.getFirstToken(node.id);

			offsets.setOffsetToken(
				[...sourceCode.getTokensBetween(firstToken, idToken), idToken],
				1,
				firstToken
			);
		},
		TSTemplateLiteralType(node: TSESTree.TSTemplateLiteralType) {
			const firstToken = sourceCode.getFirstToken(node);
			const quasiTokens = node.quasis.slice(1).map((n) => sourceCode.getFirstToken(n));
			const expressionToken = node.quasis.slice(0, -1).map((n) => sourceCode.getTokenAfter(n));

			offsets.setOffsetToken(quasiTokens, 0, firstToken);
			offsets.setOffsetToken(expressionToken, 1, firstToken);
		},

		// ----------------------------------------------------------------------
		// NON-STANDARD NODES
		// ----------------------------------------------------------------------
		Decorator(node: TSESTree.Decorator) {
			// @Decorator
			const [atToken, secondToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			offsets.setOffsetToken(secondToken, 0, atToken);

			const parent = node.parent;
			const { decorators } = parent as { decorators?: TSESTree.Decorator[] };
			if (!decorators || decorators.length === 0) {
				return;
			}
			if (decorators[0] === node) {
				if (parent.range[0] === node.range[0]) {
					const startParentToken = sourceCode.getTokenAfter(decorators[decorators?.length - 1]);
					offsets.setOffsetToken(startParentToken, 0, atToken);
				} else {
					const startParentToken = sourceCode.getFirstToken(
						parent.parent &&
							(parent.parent.type === 'ExportDefaultDeclaration' ||
								parent.parent.type === 'ExportNamedDeclaration') &&
							node.range[0] < parent.parent.range[0]
							? parent.parent
							: parent
					);
					offsets.copyOffset(atToken.range[0], startParentToken.range[0]);
				}
			} else {
				offsets.setOffsetToken(atToken, 0, sourceCode.getFirstToken(decorators[0]));
			}
		},
		AccessorProperty(node: TSESTree.AccessorProperty) {
			const keyNode = node.key;
			const valueNode = node.value;
			const firstToken = sourceCode.getFirstToken(node);
			const keyTokens = getFirstAndLastTokens(sourceCode, keyNode);
			const prefixTokens = sourceCode.getTokensBetween(firstToken, keyTokens.firstToken);
			if (node.computed) {
				prefixTokens.pop(); // pop [
			}
			offsets.setOffsetToken(prefixTokens, 0, firstToken);
			let lastKeyToken;
			if (node.computed) {
				const leftBracketToken = sourceCode.getTokenBefore(keyTokens.firstToken)!;
				const rightBracketToken = (lastKeyToken = sourceCode.getTokenAfter(keyTokens.lastToken)!);
				offsets.setOffsetToken(leftBracketToken, 0, firstToken);
				offsets.setOffsetElementList([keyNode], leftBracketToken, rightBracketToken, 1);
			} else {
				offsets.setOffsetToken(keyTokens.firstToken, 0, firstToken);
				lastKeyToken = keyTokens.lastToken;
			}

			if (valueNode != null) {
				const initToken = sourceCode.getFirstToken(valueNode);
				offsets.setOffsetToken(
					[...sourceCode.getTokensBetween(lastKeyToken, initToken), initToken],
					1,
					lastKeyToken
				);
			}
		},
		StaticBlock(node: TSESTree.StaticBlock) {
			const firstToken = sourceCode.getFirstToken(node);
			let next = sourceCode.getTokenAfter(firstToken);
			while (next && isNotOpeningBraceToken(next)) {
				offsets.setOffsetToken(next, 0, firstToken);
				next = sourceCode.getTokenAfter(next);
			}
			offsets.setOffsetToken(next, 0, firstToken);
			offsets.setOffsetElementList(node.body, next!, sourceCode.getLastToken(node), 1);
		},
		ImportAttribute(node: TSESTree.ImportAttribute) {
			const firstToken = sourceCode.getFirstToken(node);
			const keyTokens = getFirstAndLastTokens(sourceCode, node.key);
			const prefixTokens = sourceCode.getTokensBetween(firstToken, keyTokens.firstToken);
			offsets.setOffsetToken(prefixTokens, 0, firstToken);

			offsets.setOffsetToken(keyTokens.firstToken, 0, firstToken);

			const initToken = sourceCode.getFirstToken(node.value);
			offsets.setOffsetToken(
				[...sourceCode.getTokensBetween(keyTokens.lastToken, initToken), initToken],
				1,
				keyTokens.lastToken
			);
		},
		// ----------------------------------------------------------------------
		// SINGLE TOKEN NODES
		// ----------------------------------------------------------------------
		// VALUES KEYWORD
		TSAnyKeyword() {
			// noop
		},
		TSBigIntKeyword() {
			// noop
		},
		TSBooleanKeyword() {
			// noop
		},
		TSNeverKeyword() {
			// noop
		},
		TSNullKeyword() {
			// noop
		},
		TSNumberKeyword() {
			// noop
		},
		TSObjectKeyword() {
			// noop
		},
		TSStringKeyword() {
			// noop
		},
		TSSymbolKeyword() {
			// noop
		},
		TSUndefinedKeyword() {
			// noop
		},
		TSUnknownKeyword() {
			// noop
		},
		TSVoidKeyword() {
			// noop
		},
		// MODIFIERS KEYWORD
		TSAbstractKeyword() {
			// noop
		},
		TSAsyncKeyword() {
			// noop
		},
		TSPrivateKeyword() {
			// noop
		},
		TSProtectedKeyword() {
			// noop
		},
		TSPublicKeyword() {
			// noop
		},
		TSReadonlyKeyword() {
			// noop
		},
		TSStaticKeyword() {
			// noop
		},
		// OTHERS KEYWORD
		TSDeclareKeyword() {
			// noop
		},
		TSExportKeyword() {
			// noop
		},
		TSIntrinsicKeyword() {
			// noop
		},
		// OTHERS
		TSThisType() {
			// noop
		},
		// ----------------------------------------------------------------------
		// WRAPPER NODES
		// ----------------------------------------------------------------------
		TSLiteralType() {
			// noop
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
	const commonsVisitor: any = {
		// Process semicolons.
		['TSTypeAliasDeclaration, TSCallSignatureDeclaration, TSConstructSignatureDeclaration, TSImportEqualsDeclaration,' +
			'TSAbstractMethodDefinition, TSAbstractPropertyDefinition, AccessorProperty,  TSAbstractAccessorProperty, TSEnumMember,' +
			'TSPropertySignature, TSIndexSignature, TSMethodSignature,' +
			'TSAbstractClassProperty, ClassProperty'](node: TSESTree.Node) {
			const firstToken = sourceCode.getFirstToken(node);
			const lastToken = sourceCode.getLastToken(node);
			if (isSemicolonToken(lastToken) && firstToken !== lastToken) {
				const next = sourceCode.getTokenAfter(lastToken);
				if (!next || lastToken.loc.start.line < next.loc.start.line) {
					// End of line semicolons
					offsets.setOffsetToken(lastToken, 0, firstToken);
				}
			}
		},
		'*[type=/^TS/]'(node: TSESTree.Node) {
			if (
				node.type !== 'TSAnyKeyword' &&
				node.type !== 'TSArrayType' &&
				node.type !== 'TSBigIntKeyword' &&
				node.type !== 'TSBooleanKeyword' &&
				node.type !== 'TSConditionalType' &&
				node.type !== 'TSConstructorType' &&
				node.type !== 'TSFunctionType' &&
				node.type !== 'TSImportType' &&
				node.type !== 'TSIndexedAccessType' &&
				node.type !== 'TSInferType' &&
				node.type !== 'TSIntersectionType' &&
				node.type !== 'TSIntrinsicKeyword' &&
				node.type !== 'TSLiteralType' &&
				node.type !== 'TSMappedType' &&
				node.type !== 'TSNamedTupleMember' &&
				node.type !== 'TSNeverKeyword' &&
				node.type !== 'TSNullKeyword' &&
				node.type !== 'TSNumberKeyword' &&
				node.type !== 'TSObjectKeyword' &&
				node.type !== 'TSOptionalType' &&
				node.type !== 'TSRestType' &&
				node.type !== 'TSStringKeyword' &&
				node.type !== 'TSSymbolKeyword' &&
				node.type !== 'TSTemplateLiteralType' &&
				node.type !== 'TSThisType' &&
				node.type !== 'TSTupleType' &&
				node.type !== 'TSTypeLiteral' &&
				node.type !== 'TSTypeOperator' &&
				node.type !== 'TSTypePredicate' &&
				node.type !== 'TSTypeQuery' &&
				node.type !== 'TSTypeReference' &&
				node.type !== 'TSUndefinedKeyword' &&
				node.type !== 'TSUnionType' &&
				node.type !== 'TSUnknownKeyword' &&
				node.type !== 'TSVoidKeyword'
			) {
				return;
			}
			const typeNode: TSESTree.TypeNode = node;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
			if ((typeNode.parent as any).type === 'TSParenthesizedType') {
				return;
			}
			// Process parentheses.
			let leftToken = sourceCode.getTokenBefore(typeNode);
			let rightToken = sourceCode.getTokenAfter(typeNode);
			let firstToken = sourceCode.getFirstToken(typeNode);

			while (
				leftToken &&
				isOpeningParenToken(leftToken) &&
				rightToken &&
				isClosingParenToken(rightToken)
			) {
				offsets.setOffsetToken(firstToken, 1, leftToken);
				offsets.setOffsetToken(rightToken, 0, leftToken);

				firstToken = leftToken;
				leftToken = sourceCode.getTokenBefore(leftToken);
				rightToken = sourceCode.getTokenAfter(rightToken);
			}
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
	const extendsESVisitor: any = {
		['ClassDeclaration[implements], ClassDeclaration[typeParameters], ClassDeclaration[superTypeParameters],' +
			'ClassExpression[implements], ClassExpression[typeParameters], ClassExpression[superTypeParameters]'](
			node: TSESTree.ClassDeclaration | TSESTree.ClassExpression
		) {
			if (node.typeParameters != null) {
				offsets.setOffsetToken(
					sourceCode.getFirstToken(node.typeParameters),
					1,
					sourceCode.getFirstToken(node.id || node)
				);
			}
			const superTypeArguments =
				node.superTypeArguments ??
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
				(node as any).superTypeParameters;
			if (superTypeArguments != null && node.superClass != null) {
				offsets.setOffsetToken(
					sourceCode.getFirstToken(superTypeArguments),
					1,
					sourceCode.getFirstToken(node.superClass)
				);
			}
			if (node.implements != null && node.implements.length) {
				const classToken = sourceCode.getFirstToken(node);
				const implementsToken = sourceCode.getTokenBefore(node.implements[0])!;
				offsets.setOffsetToken(implementsToken, 1, classToken);

				offsets.setOffsetElementList(node.implements, implementsToken, null, 1);
			}
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
	const deprecatedVisitor: any = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
		TSParenthesizedType(node: any) {
			// (T)
			offsets.setOffsetElementList(
				[node.typeAnnotation],
				sourceCode.getFirstToken(node),
				sourceCode.getLastToken(node),
				1
			);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
		ClassProperty(node: any) {
			visitor.TSAbstractMethodDefinition(node);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
		TSAbstractClassProperty(node: any) {
			visitor.TSAbstractMethodDefinition(node);
		}
	};
	const v: NodeListener = visitor;

	return {
		...v,
		...commonsVisitor,
		...extendsESVisitor,
		...deprecatedVisitor
	};
}
