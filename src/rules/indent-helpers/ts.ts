import type { TSESTree } from "@typescript-eslint/types"
import type * as ESTree from "estree"
import {
  isClosingBracketToken,
  isClosingParenToken,
  isNotClosingParenToken,
  isOpeningBracketToken,
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
  [T in keyof NodeListenerMap]: (node: NodeListenerMap[T]) => void
}

/**
 * Creates AST event handlers for svelte nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener {
  const { setOffset, sourceCode, copyOffset } = context
  const visitor: NodeListener = {
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
    TSFunctionType(node: TSESTree.TSFunctionType) {
      const leftParenToken = sourceCode.getFirstToken(node)
      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)

      const arrowToken = sourceCode.getTokenAfter(rightParenToken)
      setOffset(arrowToken, 1, leftParenToken)
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
      const [firstToken, secondToken, ...afterTokens] =
        sourceCode.getTokens(node)
      setOffset(secondToken, 1, firstToken)

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
    TSInterfaceBody(node: TSESTree.TSInterfaceBody) {
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

    // ----------------------------------------------------------------------
    // NON-STANDARD NODES
    // ----------------------------------------------------------------------
    ClassProperty(node: TSESTree.ClassProperty) {
      const firstToken = sourceCode.getFirstToken(node)
      const keyTokens = getFirstAndLastTokens(sourceCode, node.key)
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
          [node.key],
          leftBracketToken,
          rightBracketToken,
          1,
        )
      } else {
        setOffset(keyTokens.firstToken, 0, firstToken)
        lastKeyToken = keyTokens.lastToken
      }

      if (node.value != null) {
        const eqToken = sourceCode.getTokenAfter(lastKeyToken)!
        const initToken = sourceCode.getTokenAfter(eqToken)

        setOffset([eqToken, initToken], 1, lastKeyToken)
      }
    },
    // ----------------------------------------------------------------------
    // SINGLE TOKEN NODES
    // ----------------------------------------------------------------------
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
    // ----------------------------------------------------------------------
    // WRAPPER NODES
    // ----------------------------------------------------------------------
    TSLiteralType() {
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

  return {
    ...visitor,
    ...extendsESVisitor,
  }
}
