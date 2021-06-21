import type { TSESTree } from "@typescript-eslint/types"
import type * as ESTree from "estree"
import {
  isClosingBracketToken,
  isClosingParenToken,
  isNotClosingParenToken,
  isOpeningBraceToken,
  isOpeningBracketToken,
  isOpeningParenToken,
} from "eslint-utils"
import type { AnyToken, IndentContext } from "./commons"
import { isBeginningOfLine } from "./commons"
import { setOffsetNodes } from "./commons"
import { getFirstAndLastTokens } from "./commons"

type NodeWithoutES = Exclude<TSESTree.Node, { type: ESTree.Node["type"] }>
type NodeListenerMap<T extends NodeWithoutES = NodeWithoutES> = {
  [key in NodeWithoutES["type"]]: T extends { type: key } ? T : never
}
type NodeListener = {
  [T in keyof NodeListenerMap]?: (node: NodeListenerMap[T]) => void
}

/**
 * Creates AST event handlers for svelte nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener {
  const { setOffset, sourceCode, copyOffset } = context
  const visitor = {
    TSTypeAnnotation(node: TSESTree.TSTypeAnnotation) {
      // : Type
      // => Type
      const [colonOrArrowToken, secondToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      setOffset(
        [colonOrArrowToken, secondToken],
        1,
        sourceCode.getFirstToken(node.parent!),
      )
    },
    TSAsExpression(node: TSESTree.TSAsExpression) {
      // foo as T
      const expressionTokens = getFirstAndLastTokens(
        sourceCode,
        node.expression as ESTree.Expression,
      )
      const asToken = sourceCode.getTokenAfter(expressionTokens.lastToken)!
      setOffset(
        [
          asToken,
          getFirstAndLastTokens(sourceCode, node.typeAnnotation).firstToken,
        ],
        1,
        expressionTokens.firstToken,
      )
    },
    TSTypeReference(node: TSESTree.TSTypeReference) {
      // T<U>
      if (node.typeParameters) {
        const typeNameTokens = getFirstAndLastTokens(sourceCode, node.typeName)
        setOffset(
          sourceCode.getFirstToken(node.typeParameters),
          1,
          typeNameTokens.firstToken,
        )
      }
    },
    TSTypeParameterInstantiation(
      node:
        | TSESTree.TSTypeParameterInstantiation
        | TSESTree.TSTypeParameterDeclaration,
    ) {
      // <T>
      setOffsetNodes(
        context,
        node.params,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    TSTypeParameterDeclaration(node: TSESTree.TSTypeParameterDeclaration) {
      // <T>
      visitor.TSTypeParameterInstantiation(node)
    },
    TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
      // type T = {}
      const typeToken = sourceCode.getFirstToken(node)
      const idToken = sourceCode.getFirstToken(node.id)
      setOffset(idToken, 1, typeToken)

      let eqToken
      if (node.typeParameters) {
        setOffset(sourceCode.getFirstToken(node.typeParameters), 1, idToken)
        eqToken = sourceCode.getTokenAfter(node.typeParameters)!
      } else {
        eqToken = sourceCode.getTokenAfter(node.id)!
      }

      const initToken = sourceCode.getTokenAfter(eqToken)

      setOffset([eqToken, initToken], 1, idToken)
    },
    TSFunctionType(node: TSESTree.TSFunctionType | TSESTree.TSConstructorType) {
      // ()=>void
      const firstToken = sourceCode.getFirstToken(node)
      // new or < or (
      let currToken = firstToken
      if (node.type === "TSConstructorType") {
        // currToken is new token
        // < or (
        currToken = sourceCode.getTokenAfter(currToken)!
        setOffset(currToken, 1, firstToken)
      }
      if (node.typeParameters) {
        // currToken is < token
        // (
        currToken = sourceCode.getTokenAfter(node.typeParameters)!
        setOffset(currToken, 1, firstToken)
      }
      const leftParenToken = currToken
      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)

      const arrowToken = sourceCode.getTokenAfter(rightParenToken)
      setOffset(arrowToken, 1, leftParenToken)
    },
    TSConstructorType(node: TSESTree.TSConstructorType) {
      // new ()=>void
      visitor.TSFunctionType(node)
    },
    TSTypeLiteral(node: TSESTree.TSTypeLiteral) {
      // {foo:any}
      setOffsetNodes(
        context,
        node.members,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    TSPropertySignature(node: TSESTree.TSPropertySignature) {
      // { target:any }
      //   ^^^^^^^^^^
      const firstToken = sourceCode.getFirstToken(node)
      const keyTokens = getFirstAndLastTokens(sourceCode, node.key)
      let keyLast
      if (node.computed) {
        const closeBracket = sourceCode.getTokenAfter(keyTokens.firstToken)!
        setOffsetNodes(context, [node.key], firstToken, closeBracket, 1)
        keyLast = closeBracket
      } else {
        keyLast = keyTokens.lastToken
      }
      if (node.typeAnnotation) {
        const typeAnnotationToken = sourceCode.getFirstToken(
          node.typeAnnotation,
        )
        setOffset(
          [
            ...sourceCode.getTokensBetween(keyLast, typeAnnotationToken),
            typeAnnotationToken,
          ],
          1,
          firstToken,
        )
      } else if (node.optional) {
        const qToken = sourceCode.getLastToken(node)
        setOffset(qToken, 1, firstToken)
      }
    },
    TSIndexSignature(node: TSESTree.TSIndexSignature) {
      // { [k: string ]: string[] };
      //   ^^^^^^^^^^^^^^^^^^^^^^
      const leftBracketToken = sourceCode.getFirstToken(node)
      const rightBracketToken = sourceCode.getTokenAfter(
        node.parameters[node.parameters.length - 1] || leftBracketToken,
        { filter: isClosingBracketToken, includeComments: false },
      )!
      setOffsetNodes(
        context,
        node.parameters,
        leftBracketToken,
        rightBracketToken,
        1,
      )
      const keyLast = rightBracketToken
      if (node.typeAnnotation) {
        const typeAnnotationToken = sourceCode.getFirstToken(
          node.typeAnnotation,
        )
        setOffset(
          [
            ...sourceCode.getTokensBetween(keyLast, typeAnnotationToken),
            typeAnnotationToken,
          ],
          1,
          leftBracketToken,
        )
      }
    },
    TSArrayType(node: TSESTree.TSArrayType) {
      // T[]
      const firstToken = sourceCode.getFirstToken(node)
      setOffset(
        sourceCode.getLastTokens(node, { count: 2, includeComments: false }),
        0,
        firstToken,
      )
    },
    TSTupleType(node: TSESTree.TSTupleType) {
      // [T, U]
      setOffsetNodes(
        context,
        node.elementTypes,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    TSQualifiedName(node: TSESTree.TSQualifiedName) {
      // A.B
      const objectToken = sourceCode.getFirstToken(node)
      const dotToken = sourceCode.getTokenBefore(node.right)!
      const propertyToken = sourceCode.getTokenAfter(dotToken)

      setOffset([dotToken, propertyToken], 1, objectToken)
    },
    TSIndexedAccessType(node: TSESTree.TSIndexedAccessType) {
      // A[B]
      const objectToken = sourceCode.getFirstToken(node)

      const leftBracketToken = sourceCode.getTokenBefore(node.indexType, {
        filter: isOpeningBracketToken,
        includeComments: false,
      })!
      const rightBracketToken = sourceCode.getTokenAfter(node.indexType, {
        filter: isClosingBracketToken,
        includeComments: false,
      })

      setOffset(leftBracketToken, 1, objectToken)
      setOffsetNodes(
        context,
        [node.indexType],
        leftBracketToken,
        rightBracketToken,
        1,
      )
    },
    TSUnionType(node: TSESTree.TSUnionType | TSESTree.TSIntersectionType) {
      // A | B
      const firstToken = sourceCode.getFirstToken(node)
      const types = [...node.types]
      if (
        getFirstAndLastTokens(sourceCode, types[0]).firstToken === firstToken
      ) {
        types.shift()
      }
      setOffsetNodes(
        context,
        types,
        firstToken,
        null,
        isBeginningOfLine(sourceCode, firstToken) ? 0 : 1,
      )
    },
    TSIntersectionType(node: TSESTree.TSIntersectionType) {
      // A & B
      visitor.TSUnionType(node)
    },
    TSParenthesizedType(node: TSESTree.TSParenthesizedType) {
      // (T)
      setOffsetNodes(
        context,
        [node.typeAnnotation],
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    TSMappedType(node: TSESTree.TSMappedType) {
      // {[key in foo]: bar}
      const leftBraceToken = sourceCode.getFirstToken(node)

      const leftBracketToken = sourceCode.getTokenBefore(node.typeParameter)!
      const rightBracketToken = sourceCode.getTokenAfter(
        node.nameType || node.typeParameter,
      )!
      setOffset(
        [
          ...sourceCode.getTokensBetween(leftBraceToken, leftBracketToken),
          leftBracketToken,
        ],
        1,
        leftBraceToken,
      )
      setOffsetNodes(
        context,
        [node.typeParameter, node.nameType],
        leftBracketToken,
        rightBracketToken,
        1,
      )

      const rightBraceToken = sourceCode.getLastToken(node)
      if (node.typeAnnotation) {
        const typeAnnotationToken = sourceCode.getFirstToken(
          node.typeAnnotation,
        )
        setOffset(
          [
            ...sourceCode.getTokensBetween(
              rightBracketToken,
              typeAnnotationToken,
            ),
            typeAnnotationToken,
          ],
          1,
          leftBraceToken,
        )
      } else {
        setOffset(
          [...sourceCode.getTokensBetween(rightBracketToken, rightBraceToken)],
          1,
          leftBraceToken,
        )
      }

      setOffset(rightBraceToken, 0, leftBraceToken)
    },
    TSTypeParameter(node: TSESTree.TSTypeParameter) {
      // {[key in foo]: bar}
      //   ^^^^^^^^^^
      // type T<U extends V = W>
      //        ^^^^^^^^^^^^^^^
      const [firstToken, ...afterTokens] = sourceCode.getTokens(node)

      for (const child of [node.constraint, node.default]) {
        if (!child) {
          continue
        }
        const [, ...removeTokens] = sourceCode.getTokens(child)
        for (const token of removeTokens) {
          const i = afterTokens.indexOf(token)
          if (i >= 0) {
            afterTokens.splice(i, 1)
          }
        }
      }
      const secondToken = afterTokens.shift()
      if (!secondToken) {
        return
      }
      setOffset(secondToken, 1, firstToken)

      if (secondToken.value === "extends") {
        let prevToken: AnyToken | null = null
        let token = afterTokens.shift()
        while (token) {
          if (token.value === "=") {
            break
          }
          setOffset(token, 1, secondToken)
          prevToken = token
          token = afterTokens.shift()
        }
        while (token) {
          setOffset(token, 1, prevToken || secondToken)
          token = afterTokens.shift()
        }
      } else {
        setOffset(afterTokens, 1, firstToken)
      }
    },
    TSConditionalType(node: TSESTree.TSConditionalType) {
      // T extends Foo ? T : U
      const checkTypeToken = sourceCode.getFirstToken(node)
      const extendsToken = sourceCode.getTokenAfter(node.checkType)!
      const extendsTypeToken = sourceCode.getFirstToken(node.extendsType)

      setOffset(extendsToken, 1, checkTypeToken)
      setOffset(extendsTypeToken, 1, extendsToken)

      const questionToken = sourceCode.getTokenAfter(node.extendsType, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!

      const consequentToken = sourceCode.getTokenAfter(questionToken)
      const colonToken = sourceCode.getTokenAfter(node.trueType, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const alternateToken = sourceCode.getTokenAfter(colonToken)

      let baseNode = node
      let parent = baseNode.parent
      while (
        parent &&
        parent.type === "TSConditionalType" &&
        parent.falseType === baseNode
      ) {
        baseNode = parent
        parent = baseNode.parent
      }
      const baseToken = sourceCode.getFirstToken(baseNode)

      setOffset([questionToken, colonToken], 1, baseToken)
      setOffset(consequentToken, 1, questionToken)
      setOffset(alternateToken, 1, colonToken)
    },
    TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
      // interface I {}
      const interfaceToken = sourceCode.getFirstToken(node)
      setOffset(sourceCode.getFirstToken(node.id), 1, interfaceToken)
      if (node.typeParameters != null) {
        setOffset(
          sourceCode.getFirstToken(node.typeParameters),
          1,
          sourceCode.getFirstToken(node.id),
        )
      }
      if (node.extends != null && node.extends.length) {
        const extendsToken = sourceCode.getTokenBefore(node.extends[0])!
        setOffset(extendsToken, 1, interfaceToken)
        setOffsetNodes(context, node.extends, extendsToken, null, 1)
      }
      if (node.implements != null && node.implements.length) {
        const implementsToken = sourceCode.getTokenBefore(node.implements[0])!
        setOffset(implementsToken, 1, interfaceToken)
        setOffsetNodes(context, node.implements, implementsToken, null, 1)
      }
      const bodyToken = sourceCode.getFirstToken(node.body)
      setOffset(bodyToken, 0, interfaceToken)
    },
    TSInterfaceBody(node: TSESTree.TSInterfaceBody | TSESTree.TSModuleBlock) {
      setOffsetNodes(
        context,
        node.body,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    TSClassImplements(
      node: TSESTree.TSClassImplements | TSESTree.TSInterfaceHeritage,
    ) {
      // class C implements T {}
      //                    ^
      if (node.typeParameters) {
        setOffset(
          sourceCode.getFirstToken(node.typeParameters),
          1,
          sourceCode.getFirstToken(node),
        )
      }
    },
    TSInterfaceHeritage(node: TSESTree.TSInterfaceHeritage) {
      // interface I extends E implements T {}
      //                     ^            ^
      visitor.TSClassImplements(node)
    },
    TSEnumDeclaration(node: TSESTree.TSEnumDeclaration) {
      // enum E {}
      const firstToken = sourceCode.getFirstToken(node)
      const idTokens = getFirstAndLastTokens(sourceCode, node.id)
      const prefixTokens = sourceCode.getTokensBetween(
        firstToken,
        idTokens.firstToken,
      )
      setOffset(prefixTokens, 0, firstToken)
      setOffset(idTokens.firstToken, 1, firstToken)

      const leftBraceToken = sourceCode.getTokenAfter(idTokens.lastToken)!
      const rightBraceToken = sourceCode.getLastToken(node)
      setOffset(leftBraceToken, 0, firstToken)
      setOffsetNodes(context, node.members, leftBraceToken, rightBraceToken, 1)
    },
    TSModuleDeclaration(node: TSESTree.TSModuleDeclaration) {
      const firstToken = sourceCode.getFirstToken(node)
      const idTokens = getFirstAndLastTokens(sourceCode, node.id)
      const prefixTokens = sourceCode.getTokensBetween(
        firstToken,
        idTokens.firstToken,
      )
      setOffset(prefixTokens, 0, firstToken)
      setOffset(idTokens.firstToken, 1, firstToken)

      if (node.body) {
        const bodyFirstToken = sourceCode.getFirstToken(node.body)
        setOffset(
          bodyFirstToken,
          isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
          firstToken,
        )
      }
    },
    TSModuleBlock(node: TSESTree.TSModuleBlock) {
      visitor.TSInterfaceBody(node)
    },
    TSMethodSignature(node: TSESTree.TSMethodSignature) {
      // fn(arg: A): R | null;
      const firstToken = sourceCode.getFirstToken(node)
      const keyTokens = getFirstAndLastTokens(sourceCode, node.key)
      let keyLast
      if (node.computed) {
        const closeBracket = sourceCode.getTokenAfter(keyTokens.firstToken)!
        setOffsetNodes(context, [node.key], firstToken, closeBracket, 1)
        keyLast = closeBracket
      } else {
        keyLast = keyTokens.lastToken
      }
      const leftParenToken = sourceCode.getTokenAfter(keyLast, {
        filter: isOpeningParenToken,
        includeComments: false,
      })!
      setOffset(
        [
          ...sourceCode.getTokensBetween(keyLast, leftParenToken),
          leftParenToken,
        ],
        1,
        firstToken,
      )
      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)
      if (node.returnType) {
        const typeAnnotationToken = sourceCode.getFirstToken(node.returnType)
        setOffset(
          [
            ...sourceCode.getTokensBetween(keyLast, typeAnnotationToken),
            typeAnnotationToken,
          ],
          1,
          firstToken,
        )
      }
    },
    TSCallSignatureDeclaration(
      node:
        | TSESTree.TSCallSignatureDeclaration
        | TSESTree.TSConstructSignatureDeclaration,
    ) {
      // interface A { <T> (e: E): R }
      //               ^^^^^^^^^^^^^
      const firstToken = sourceCode.getFirstToken(node)
      // new or < or (
      let currToken = firstToken
      if (node.type === "TSConstructSignatureDeclaration") {
        // currToken is new token
        // < or (
        currToken = sourceCode.getTokenAfter(currToken)!
        setOffset(currToken, 1, firstToken)
      }
      if (node.typeParameters) {
        // currToken is < token
        // (
        currToken = sourceCode.getTokenAfter(node.typeParameters)!
        setOffset(currToken, 1, firstToken)
      }
      const leftParenToken = currToken
      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)

      if (node.returnType) {
        const typeAnnotationToken = sourceCode.getFirstToken(node.returnType)
        setOffset(
          [
            ...sourceCode.getTokensBetween(
              rightParenToken,
              typeAnnotationToken,
            ),
            typeAnnotationToken,
          ],
          1,
          firstToken,
        )
      }
    },
    TSConstructSignatureDeclaration(
      node: TSESTree.TSConstructSignatureDeclaration,
    ) {
      // interface A { new <T> (e: E): R }
      //               ^^^^^^^^^^^^^^^^^
      visitor.TSCallSignatureDeclaration(node)
    },
    TSEmptyBodyFunctionExpression(
      node: TSESTree.TSEmptyBodyFunctionExpression | TSESTree.TSDeclareFunction,
    ) {
      const firstToken = sourceCode.getFirstToken(node)
      let leftParenToken, bodyBaseToken
      if (firstToken.type === "Punctuator") {
        // method
        leftParenToken = firstToken
        bodyBaseToken = sourceCode.getFirstToken(node.parent!)
      } else {
        const functionToken = node.async
          ? sourceCode.getTokenAfter(firstToken)!
          : firstToken
        const starToken = node.generator
          ? sourceCode.getTokenAfter(functionToken)
          : null
        const idToken = node.id && sourceCode.getFirstToken(node.id)

        if (node.async) {
          setOffset(functionToken, 0, firstToken)
        }
        if (node.generator) {
          setOffset(starToken, 1, firstToken)
        }
        if (node.id != null) {
          setOffset(idToken, 1, firstToken)
        }

        leftParenToken = sourceCode.getTokenAfter(
          idToken || starToken || functionToken,
        )!
        bodyBaseToken = firstToken
      }

      if (!isOpeningParenToken(leftParenToken) && node.typeParameters) {
        leftParenToken = sourceCode.getTokenAfter(node.typeParameters)!
      }

      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!

      setOffset(leftParenToken, 1, bodyBaseToken)
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)
    },
    TSDeclareFunction(node: TSESTree.TSDeclareFunction) {
      // function fn(): void;
      visitor.TSEmptyBodyFunctionExpression(node)
    },
    TSTypeOperator(
      node:
        | TSESTree.TSTypeOperator
        | TSESTree.TSTypeQuery
        | TSESTree.TSInferType,
    ) {
      // keyof T
      const firstToken = sourceCode.getFirstToken(node)
      const nextToken = sourceCode.getTokenAfter(firstToken)

      setOffset(nextToken, 1, firstToken)
    },
    TSTypeQuery(node: TSESTree.TSTypeQuery) {
      // type T = typeof a
      visitor.TSTypeOperator(node)
    },
    TSInferType(node: TSESTree.TSInferType) {
      // infer U
      visitor.TSTypeOperator(node)
    },
    TSTypePredicate(node: TSESTree.TSTypePredicate) {
      // v is T
      const firstToken = sourceCode.getFirstToken(node)
      const opToken = sourceCode.getTokenAfter(node.parameterName, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const rightToken =
        node.typeAnnotation &&
        getFirstAndLastTokens(sourceCode, node.typeAnnotation).firstToken

      setOffset(
        [opToken, rightToken],
        1,
        getFirstAndLastTokens(sourceCode, firstToken).firstToken,
      )
    },
    TSAbstractMethodDefinition(
      node:
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractClassProperty
        | TSESTree.ClassProperty
        | TSESTree.TSEnumMember,
    ) {
      const { keyNode, valueNode } =
        node.type === "TSEnumMember"
          ? { keyNode: node.id, valueNode: node.initializer }
          : { keyNode: node.key, valueNode: node.value }

      const firstToken = sourceCode.getFirstToken(node)
      const keyTokens = getFirstAndLastTokens(sourceCode, keyNode)
      const prefixTokens = sourceCode.getTokensBetween(
        firstToken,
        keyTokens.firstToken,
      )
      if (node.computed) {
        prefixTokens.pop() // pop [
      }
      setOffset(prefixTokens, 0, firstToken)

      let lastKeyToken
      if (node.computed) {
        const leftBracketToken = sourceCode.getTokenBefore(
          keyTokens.firstToken,
        )!
        const rightBracketToken = (lastKeyToken = sourceCode.getTokenAfter(
          keyTokens.lastToken,
        )!)
        setOffset(leftBracketToken, 0, firstToken)
        setOffsetNodes(
          context,
          [keyNode],
          leftBracketToken,
          rightBracketToken,
          1,
        )
      } else {
        setOffset(keyTokens.firstToken, 0, firstToken)
        lastKeyToken = keyTokens.lastToken
      }

      if (
        node.type === "TSAbstractMethodDefinition"
        // || (node.type === "Property" && node.method === true)
      ) {
        const leftParenToken = sourceCode.getTokenAfter(lastKeyToken)
        setOffset(leftParenToken, 1, lastKeyToken)
        // } else if (node.type === "Property" && !node.shorthand) {
        //   const colonToken = sourceCode.getTokenAfter(lastKeyToken)!
        //   const valueToken = sourceCode.getTokenAfter(colonToken)

        //   setOffset([colonToken, valueToken], 1, lastKeyToken)
      } else if (
        (node.type === "TSAbstractClassProperty" ||
          node.type === "ClassProperty" ||
          node.type === "TSEnumMember") &&
        valueNode != null
      ) {
        const eqToken = sourceCode.getTokenAfter(lastKeyToken)!
        const initToken = sourceCode.getTokenAfter(eqToken)

        setOffset([eqToken, initToken], 1, lastKeyToken)
      }
    },
    TSAbstractClassProperty(node: TSESTree.TSAbstractClassProperty) {
      visitor.TSAbstractMethodDefinition(node)
    },
    TSEnumMember(node: TSESTree.TSEnumMember) {
      visitor.TSAbstractMethodDefinition(node)
    },
    TSOptionalType(
      node: TSESTree.TSOptionalType | TSESTree.TSNonNullExpression,
    ) {
      // [number?]
      //  ^^^^^^^
      setOffset(
        sourceCode.getLastToken(node),
        1,
        sourceCode.getFirstToken(node),
      )
    },
    TSNonNullExpression(node: TSESTree.TSNonNullExpression) {
      // v!
      visitor.TSOptionalType(node)
    },
    TSJSDocNonNullableType(
      // @ts-expect-error -- Missing TSJSDocNonNullableType type
      node: TSESTree.TSJSDocNonNullableType,
    ) {
      // T!
      visitor.TSOptionalType(node)
    },
    TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
      // <const>
      const firstToken = sourceCode.getFirstToken(node)
      const expressionToken = getFirstAndLastTokens(
        sourceCode,
        node.expression,
      ).firstToken
      setOffsetNodes(
        context,
        [node.typeAnnotation],
        firstToken,
        sourceCode.getTokenBefore(expressionToken),
        1,
      )
      setOffset(expressionToken, 1, firstToken)
    },
    TSImportType(node: TSESTree.TSImportType) {
      // import('foo').B
      const firstToken = sourceCode.getFirstToken(node)
      const leftParenToken = sourceCode.getTokenAfter(firstToken, {
        filter: isOpeningParenToken,
        includeComments: false,
      })!
      setOffset(leftParenToken, 1, firstToken)
      const rightParenToken = sourceCode.getTokenAfter(node.parameter, {
        filter: isClosingParenToken,
        includeComments: false,
      })!
      setOffsetNodes(
        context,
        [node.parameter],
        leftParenToken,
        rightParenToken,
        1,
      )
      if (node.qualifier) {
        const dotToken = sourceCode.getTokenBefore(node.qualifier)!
        const propertyToken = sourceCode.getTokenAfter(dotToken)
        setOffset([dotToken, propertyToken], 1, firstToken)
      }
      if (node.typeParameters) {
        setOffset(sourceCode.getFirstToken(node.typeParameters), 1, firstToken)
      }
    },
    TSParameterProperty(node: TSESTree.TSParameterProperty) {
      // constructor(private a)
      const firstToken = sourceCode.getFirstToken(node)
      const parameterToken = sourceCode.getFirstToken(node.parameter)
      setOffset(
        [
          ...sourceCode.getTokensBetween(firstToken, parameterToken),
          parameterToken,
        ],
        1,
        firstToken,
      )
    },
    TSImportEqualsDeclaration(node: TSESTree.TSImportEqualsDeclaration) {
      // import foo = require('foo')
      const importToken = sourceCode.getFirstToken(node)
      const idTokens = getFirstAndLastTokens(sourceCode, node.id)
      setOffset(idTokens.firstToken, 1, importToken)

      const opToken = sourceCode.getTokenAfter(idTokens.lastToken)

      setOffset(
        [opToken, sourceCode.getFirstToken(node.moduleReference)],
        1,
        idTokens.lastToken,
      )
    },
    TSExternalModuleReference(node: TSESTree.TSExternalModuleReference) {
      // require('foo')
      const requireToken = sourceCode.getFirstToken(node)
      const leftParenToken = sourceCode.getTokenAfter(requireToken, {
        filter: isOpeningParenToken,
        includeComments: false,
      })!
      const rightParenToken = sourceCode.getLastToken(node)

      setOffset(leftParenToken, 1, requireToken)
      setOffsetNodes(
        context,
        [node.expression],
        leftParenToken,
        rightParenToken,
        1,
      )
    },
    TSExportAssignment(node: TSESTree.TSExportAssignment) {
      // export = foo
      const exportNode = sourceCode.getFirstToken(node)
      const exprTokens = getFirstAndLastTokens(sourceCode, node.expression)
      const opToken = sourceCode.getTokenBefore(exprTokens.firstToken)

      setOffset([opToken, exprTokens.firstToken], 1, exportNode)
    },
    TSNamedTupleMember(node: TSESTree.TSNamedTupleMember) {
      // [a: string, ...b: string[]]
      //  ^^^^^^^^^
      const labelToken = sourceCode.getFirstToken(node)
      const elementTokens = getFirstAndLastTokens(sourceCode, node.elementType)
      setOffset(
        [
          ...sourceCode.getTokensBetween(labelToken, elementTokens.firstToken),
          elementTokens.firstToken,
        ],
        1,
        labelToken,
      )
    },
    TSRestType(node: TSESTree.TSRestType) {
      // [a: string, ...b: string[]]
      //             ^^^^^^^^^^^^^^
      const firstToken = sourceCode.getFirstToken(node)
      const nextToken = sourceCode.getTokenAfter(firstToken)

      setOffset(nextToken, 1, firstToken)
    },
    TSNamespaceExportDeclaration(node: TSESTree.TSNamespaceExportDeclaration) {
      const firstToken = sourceCode.getFirstToken(node)
      const idToken = sourceCode.getFirstToken(node.id)

      setOffset(
        [...sourceCode.getTokensBetween(firstToken, idToken), idToken],
        1,
        firstToken,
      )
    },
    TSTemplateLiteralType(node: TSESTree.TSTemplateLiteralType) {
      const firstToken = sourceCode.getFirstToken(node)
      const quasiTokens = node.quasis
        .slice(1)
        .map((n) => sourceCode.getFirstToken(n))
      const expressionToken = node.quasis
        .slice(0, -1)
        .map((n) => sourceCode.getTokenAfter(n))

      setOffset(quasiTokens, 0, firstToken)
      setOffset(expressionToken, 1, firstToken)
    },

    // ----------------------------------------------------------------------
    // NON-STANDARD NODES
    // ----------------------------------------------------------------------
    ClassProperty(node: TSESTree.ClassProperty) {
      visitor.TSAbstractMethodDefinition(node)
    },
    Decorator(node: TSESTree.Decorator) {
      // @Decorator
      const [atToken, secondToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      setOffset(secondToken, 0, atToken)

      const parent = node.parent!
      const { decorators } = parent as { decorators?: TSESTree.Decorator[] }
      if (!decorators || decorators.length === 0) {
        return
      }
      if (decorators[0] === node) {
        if (parent.range[0] === node.range[0]) {
          const startParentToken = sourceCode.getTokenAfter(
            decorators[decorators?.length - 1],
          )
          setOffset(startParentToken, 0, atToken)
        } else {
          const startParentToken = sourceCode.getFirstToken(parent)
          copyOffset(atToken, startParentToken)
        }
      } else {
        setOffset(atToken, 0, sourceCode.getFirstToken(decorators[0]))
      }
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
    },
    // ----------------------------------------------------------------------
    // JSX
    // ----------------------------------------------------------------------
    JSXElement(node: TSESTree.JSXElement) {
      setOffsetNodes(
        context,
        node.children,
        node.openingElement,
        node.closingElement,
        1,
      )
    },
    JSXFragment(node: TSESTree.JSXFragment) {
      setOffsetNodes(
        context,
        node.children,
        node.openingFragment,
        node.closingFragment,
        1,
      )
    },
    JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)

      const nameToken = sourceCode.getFirstToken(node.name)
      setOffset(nameToken, 1, openToken)
      if (node.typeParameters) {
        setOffset(sourceCode.getFirstToken(node.typeParameters), 1, nameToken)
      }
      for (const attr of node.attributes) {
        setOffset(sourceCode.getFirstToken(attr), 1, openToken)
      }
      if (node.selfClosing) {
        const slash = sourceCode.getTokenBefore(closeToken)!
        if (slash.value === "/") {
          setOffset(slash, 0, openToken)
        }
      }
      setOffset(closeToken, 0, openToken)
    },
    JSXClosingElement(node: TSESTree.JSXClosingElement) {
      const openToken = sourceCode.getFirstToken(node)
      const slash = sourceCode.getTokenAfter(openToken)!
      if (slash.value === "/") {
        setOffset(slash, 0, openToken)
      }
      const closeToken = sourceCode.getLastToken(node)
      const nameToken = sourceCode.getFirstToken(node.name)
      setOffset(nameToken, 1, openToken)
      setOffset(closeToken, 0, openToken)
    },
    JSXOpeningFragment(
      node: TSESTree.JSXOpeningFragment | TSESTree.JSXClosingFragment,
    ) {
      const [firstToken, ...tokens] = sourceCode.getTokens(node)
      setOffset(tokens, 0, firstToken)
    },
    JSXClosingFragment(node: TSESTree.JSXClosingFragment) {
      visitor.JSXOpeningFragment(node)
    },
    JSXAttribute(node: TSESTree.JSXAttribute) {
      if (!node.value) {
        return
      }
      const keyToken = sourceCode.getFirstToken(node)
      const eqToken = sourceCode.getTokenAfter(node.name)
      setOffset(eqToken, 1, keyToken)
      setOffset(sourceCode.getFirstToken(node.value), 1, keyToken)
    },
    JSXExpressionContainer(node: TSESTree.JSXExpressionContainer) {
      setOffsetNodes(
        context,
        [node.expression],
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    JSXSpreadAttribute(node: TSESTree.JSXSpreadAttribute) {
      setOffsetNodes(
        context,
        [node.argument],
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    JSXSpreadChild(node: TSESTree.JSXSpreadChild) {
      setOffsetNodes(
        context,
        [node.expression],
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    JSXMemberExpression(node: TSESTree.JSXMemberExpression) {
      const objectToken = sourceCode.getFirstToken(node)
      const dotToken = sourceCode.getTokenBefore(node.property)!
      const propertyToken = sourceCode.getTokenAfter(dotToken)

      setOffset([dotToken, propertyToken], 1, objectToken)
    },
    // ----------------------------------------------------------------------
    // JSX SINGLE TOKEN NODES
    // ----------------------------------------------------------------------
    JSXEmptyExpression() {
      // noop
    },
    JSXIdentifier() {
      // noop
    },
    JSXNamespacedName() {
      // noop
    },
    JSXText() {
      // noop
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  const extendsESVisitor: any = {
    ["ClassDeclaration[implements], ClassDeclaration[typeParameters], ClassDeclaration[superTypeParameters]," +
      "ClassExpression[implements], ClassExpression[typeParameters], ClassExpression[superTypeParameters]"](
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    ) {
      if (node.typeParameters != null) {
        setOffset(
          sourceCode.getFirstToken(node.typeParameters),
          1,
          sourceCode.getFirstToken(node.id || node),
        )
      }
      if (node.superTypeParameters != null && node.superClass != null) {
        setOffset(
          sourceCode.getFirstToken(node.superTypeParameters),
          1,
          sourceCode.getFirstToken(node.superClass),
        )
      }
      if (node.implements != null && node.implements.length) {
        const classToken = sourceCode.getFirstToken(node)
        const implementsToken = sourceCode.getTokenBefore(node.implements[0])!
        setOffset(implementsToken, 1, classToken)

        setOffsetNodes(context, node.implements, implementsToken, null, 1)
      }
    },
  }
  const v: NodeListener = visitor

  return {
    ...v,
    ...extendsESVisitor,
  }
}
