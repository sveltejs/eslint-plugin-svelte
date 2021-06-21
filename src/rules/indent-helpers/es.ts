import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import type { TSESTree } from "@typescript-eslint/types"
import type { ASTNode } from "../../types"
import type { IndentContext } from "./commons"
import { getFirstAndLastTokens } from "./commons"
import { setOffsetNodes } from "./commons"
import {
  isArrowToken,
  isClosingBraceToken,
  isClosingBracketToken,
  isClosingParenToken,
  isNotClosingParenToken,
  isNotOpeningParenToken,
  isOpeningBraceToken,
  isOpeningBracketToken,
  isOpeningParenToken,
  isSemicolonToken,
} from "eslint-utils"

type NodeWithParent =
  | (Exclude<ESTree.Node, ESTree.Program> & { parent: ASTNode })
  | AST.SvelteProgram
  | AST.SvelteReactiveStatement
type NodeListenerMap<T extends NodeWithParent = NodeWithParent> = {
  [key in NodeWithParent["type"]]: T extends { type: key } ? T : never
}

type NodeListener = {
  [T in keyof NodeListenerMap]: (node: NodeListenerMap[T]) => void
}

/**
 * Creates AST event handlers for ES nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener & {
  ":expression": (node: ESTree.Expression) => void
  ":statement": (node: ESTree.Statement) => void
} {
  const { sourceCode, options, setOffsetBaseLine, setOffset } = context

  /**
   * Find the root of left node.
   */
  function getRootLeft(
    node:
      | ESTree.AssignmentExpression
      | ESTree.AssignmentPattern
      | ESTree.BinaryExpression
      | ESTree.LogicalExpression,
  ) {
    let target = node
    let parent = getParent(target)
    while (
      parent &&
      (parent.type === "AssignmentExpression" ||
        parent.type === "AssignmentPattern" ||
        parent.type === "BinaryExpression" ||
        parent.type === "LogicalExpression")
    ) {
      const prevToken = sourceCode.getTokenBefore(target)
      if (prevToken && isOpeningParenToken(prevToken)) {
        break
      }
      target = parent
      parent = getParent(target)
    }
    return target.left
  }

  const visitor = {
    Program(node: AST.SvelteProgram) {
      for (const body of node.body) {
        if (body.type === "SvelteText" && !body.value.trim()) {
          continue
        }
        setOffsetBaseLine(sourceCode.getFirstToken(body), 0)
      }
    },
    ArrayExpression(node: ESTree.ArrayExpression | ESTree.ArrayPattern) {
      setOffsetNodes(
        context,
        node.elements,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    ArrayPattern(node: ESTree.ArrayPattern) {
      visitor.ArrayExpression(node)
    },
    ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression) {
      const [firstToken, secondToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      const leftToken = node.async ? secondToken : firstToken
      const arrowToken = sourceCode.getTokenBefore(node.body, {
        filter: isArrowToken,
        includeComments: false,
      })

      if (node.async) {
        setOffset(secondToken, 1, firstToken)
      }
      if (isOpeningParenToken(leftToken)) {
        const rightToken = sourceCode.getTokenAfter(
          node.params[node.params.length - 1] || leftToken,
          { filter: isClosingParenToken, includeComments: false },
        )
        setOffsetNodes(context, node.params, leftToken, rightToken, 1)
      }

      setOffset(arrowToken, 1, firstToken)

      const bodyFirstToken = sourceCode.getFirstToken(node.body)
      setOffset(
        bodyFirstToken,
        isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
        firstToken,
      )
    },
    AssignmentExpression(
      node:
        | ESTree.AssignmentExpression
        | ESTree.AssignmentPattern
        | ESTree.BinaryExpression
        | ESTree.LogicalExpression,
    ) {
      const leftNode = getRootLeft(node)
      const opToken = sourceCode.getTokenAfter(node.left, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const rightToken = getFirstAndLastTokens(
        sourceCode,
        node.right,
      ).firstToken

      setOffset(
        [opToken, rightToken],
        1,
        getFirstAndLastTokens(sourceCode, leftNode).firstToken,
      )
    },
    AssignmentPattern(node: ESTree.AssignmentPattern) {
      visitor.AssignmentExpression(node)
    },
    BinaryExpression(node: ESTree.BinaryExpression) {
      visitor.AssignmentExpression(node)
    },
    LogicalExpression(node: ESTree.LogicalExpression) {
      visitor.AssignmentExpression(node)
    },
    AwaitExpression(
      node:
        | ESTree.AwaitExpression
        | ESTree.RestElement
        | ESTree.SpreadElement
        | ESTree.UnaryExpression,
    ) {
      // `await`, `...`, or UnaryOperator
      const firstToken = sourceCode.getFirstToken(node)
      const nextToken = sourceCode.getTokenAfter(firstToken)

      setOffset(nextToken, 1, firstToken)
    },
    RestElement(node: ESTree.RestElement) {
      visitor.AwaitExpression(node)
    },
    SpreadElement(node: ESTree.SpreadElement) {
      visitor.AwaitExpression(node)
    },
    UnaryExpression(node: ESTree.UnaryExpression) {
      visitor.AwaitExpression(node)
    },
    BlockStatement(node: ESTree.BlockStatement | ESTree.ClassBody) {
      setOffsetNodes(
        context,
        node.body,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    ClassBody(node: ESTree.ClassBody) {
      visitor.BlockStatement(node)
    },
    BreakStatement(node: ESTree.BreakStatement | ESTree.ContinueStatement) {
      if (node.label) {
        const firstToken = sourceCode.getFirstToken(node)
        const nextToken = sourceCode.getTokenAfter(firstToken)

        setOffset(nextToken, 1, firstToken)
      }
    },
    ContinueStatement(node: ESTree.ContinueStatement) {
      visitor.BreakStatement(node)
    },
    CallExpression(node: ESTree.CallExpression) {
      const firstToken = sourceCode.getFirstToken(node)
      const leftParenToken = sourceCode.getTokenAfter(node.callee, {
        filter: isOpeningParenToken,
        includeComments: false,
      })!
      const rightParenToken = sourceCode.getLastToken(node)

      for (const optionalToken of sourceCode.getTokensBetween(
        sourceCode.getLastToken(node.callee),
        leftParenToken,
        { filter: isOptionalToken, includeComments: false },
      )) {
        setOffset(optionalToken, 1, firstToken)
      }

      setOffset(leftParenToken, 1, firstToken)
      setOffsetNodes(
        context,
        node.arguments,
        leftParenToken,
        rightParenToken,
        1,
      )
    },
    CatchClause(node: ESTree.CatchClause) {
      const catchToken = sourceCode.getFirstToken(node)

      if (node.param != null) {
        const leftParenToken = sourceCode.getTokenBefore(node.param)!
        const rightParenToken = sourceCode.getTokenAfter(node.param)

        setOffset(leftParenToken, 1, catchToken)
        setOffsetNodes(
          context,
          [node.param],
          leftParenToken,
          rightParenToken,
          1,
        )
      }
      const bodyToken = sourceCode.getFirstToken(node.body)
      setOffset(bodyToken, 0, catchToken)
    },
    ClassDeclaration(node: ESTree.ClassDeclaration | ESTree.ClassExpression) {
      const classToken = sourceCode.getFirstToken(node)

      if (node.id != null) {
        setOffset(sourceCode.getFirstToken(node.id), 1, classToken)
      }
      if (node.superClass != null) {
        const extendsToken = sourceCode.getTokenBefore(node.superClass)!
        const superClassToken = sourceCode.getTokenAfter(extendsToken)
        setOffset(extendsToken, 1, classToken)
        setOffset(superClassToken, 1, extendsToken)
      }
      const bodyToken = sourceCode.getFirstToken(node.body)
      setOffset(bodyToken, 0, classToken)
    },
    ClassExpression(node: ESTree.ClassExpression) {
      visitor.ClassDeclaration(node)
    },
    ConditionalExpression(node: ESTree.ConditionalExpression) {
      const questionToken = sourceCode.getTokenAfter(node.test, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!

      const consequentToken = sourceCode.getTokenAfter(questionToken)
      const colonToken = sourceCode.getTokenAfter(node.consequent, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const alternateToken = sourceCode.getTokenAfter(colonToken)

      let baseNode = node
      let parent = getParent(baseNode)
      while (
        parent &&
        parent.type === "ConditionalExpression" &&
        parent.alternate === baseNode
      ) {
        baseNode = parent
        parent = getParent(baseNode)
      }
      const baseToken = sourceCode.getFirstToken(baseNode)

      setOffset([questionToken, colonToken], 1, baseToken)
      setOffset(consequentToken, 1, questionToken)
      setOffset(alternateToken, 1, colonToken)
    },
    DoWhileStatement(node: ESTree.DoWhileStatement) {
      const doToken = sourceCode.getFirstToken(node)
      const whileToken = sourceCode.getTokenAfter(node.body, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const leftParenToken = sourceCode.getTokenAfter(whileToken)!
      const rightParenToken = sourceCode.getTokenAfter(node.test)!

      const bodyFirstToken = sourceCode.getFirstToken(node.body)
      setOffset(
        bodyFirstToken,
        isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
        doToken,
      )

      setOffset(whileToken, 0, doToken)
      setOffset(leftParenToken, 1, whileToken)
      setOffsetNodes(context, [node.test], leftParenToken, rightParenToken, 1)
    },
    ExportAllDeclaration(node: ESTree.ExportAllDeclaration) {
      const exportToken = sourceCode.getFirstToken(node)
      const tokens = sourceCode.getTokensBetween(exportToken, node.source)
      const fromIndex = tokens.findIndex((t) => t.value === "from")
      const fromToken = tokens[fromIndex]
      const beforeTokens = tokens.slice(0, fromIndex)
      const afterTokens = [
        ...tokens.slice(fromIndex + 1),
        sourceCode.getFirstToken(node.source),
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- type bug?
      if (!(node as any).exported) {
        // export * from "mod"
        setOffset(beforeTokens, 1, exportToken)
      } else {
        // export * as foo from "mod"
        const asIndex = beforeTokens.findIndex((t) => t.value === "as")
        setOffset(beforeTokens.slice(0, asIndex), 1, exportToken)
        setOffset(beforeTokens.slice(asIndex), 1, beforeTokens[asIndex - 1])
      }
      setOffset(fromToken, 0, exportToken)
      setOffset(afterTokens, 1, fromToken)
    },
    ExportDefaultDeclaration(node: ESTree.ExportDefaultDeclaration) {
      const exportToken = sourceCode.getFirstToken(node)
      const declarationToken = getFirstAndLastTokens(
        sourceCode,
        node.declaration,
      ).firstToken
      const defaultTokens = sourceCode.getTokensBetween(
        exportToken,
        declarationToken,
      )
      setOffset([...defaultTokens, declarationToken], 1, exportToken)
    },
    ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
      const exportToken = sourceCode.getFirstToken(node)
      if (node.declaration) {
        // export var foo = 1;
        const declarationToken = sourceCode.getFirstToken(node.declaration)
        setOffset(declarationToken, 1, exportToken)
      } else {
        const firstSpecifier = node.specifiers[0]
        if (!firstSpecifier || firstSpecifier.type === "ExportSpecifier") {
          // export {foo, bar}; or export {foo, bar} from "mod";
          const leftBraceTokens = sourceCode.getTokensBetween(
            exportToken,
            firstSpecifier,
          )
          const rightBraceToken = sourceCode.getLastToken(node, {
            filter: isClosingBraceToken,
            includeComments: false,
          })!
          setOffset(leftBraceTokens, 0, exportToken)
          setOffsetNodes(
            context,
            node.specifiers,
            leftBraceTokens[leftBraceTokens.length - 1],
            rightBraceToken,
            1,
          )

          if (node.source) {
            const [fromToken, ...tokens] = sourceCode.getTokensBetween(
              rightBraceToken,
              node.source,
            )

            setOffset(fromToken, 0, exportToken)
            setOffset(
              [...tokens, sourceCode.getFirstToken(node.source)],
              1,
              fromToken,
            )
          }
        } else {
          // maybe babel-eslint
        }
      }
    },
    ExportSpecifier(node: ESTree.ExportSpecifier) {
      const [firstToken, ...tokens] = sourceCode.getTokens(node)
      setOffset(tokens, 1, firstToken)
    },
    ForInStatement(node: ESTree.ForInStatement | ESTree.ForOfStatement) {
      const forToken = sourceCode.getFirstToken(node)
      const awaitToken =
        (node.type === "ForOfStatement" &&
          node.await &&
          sourceCode.getTokenAfter(forToken)) ||
        null
      const leftParenToken = sourceCode.getTokenAfter(awaitToken || forToken)!
      const leftToken = sourceCode.getFirstToken(node.left)
      const inOrOfToken = sourceCode.getTokenAfter(node.left, {
        filter: isNotClosingParenToken,
        includeComments: false,
      })!
      const rightToken = sourceCode.getTokenAfter(inOrOfToken)
      const rightParenToken = sourceCode.getTokenBefore(node.body, {
        filter: isNotOpeningParenToken,
        includeComments: false,
      })!

      if (awaitToken != null) {
        setOffset(awaitToken, 0, forToken)
      }
      setOffset(leftParenToken, 1, forToken)
      setOffset(leftToken, 1, leftParenToken)
      setOffset([inOrOfToken, rightToken], 1, leftToken)
      setOffset(rightParenToken, 0, leftParenToken)

      const bodyFirstToken = sourceCode.getFirstToken(node.body)
      setOffset(
        bodyFirstToken,
        isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
        forToken,
      )
    },
    ForOfStatement(node: ESTree.ForOfStatement) {
      visitor.ForInStatement(node)
    },
    ForStatement(node: ESTree.ForStatement) {
      const forToken = sourceCode.getFirstToken(node)
      const leftParenToken = sourceCode.getTokenAfter(forToken)!
      const rightParenToken = sourceCode.getTokenBefore(node.body, {
        filter: isNotOpeningParenToken,
        includeComments: false,
      })

      setOffset(leftParenToken, 1, forToken)
      setOffsetNodes(
        context,
        [node.init, node.test, node.update],
        leftParenToken,
        rightParenToken,
        1,
      )

      const bodyFirstToken = sourceCode.getFirstToken(node.body)
      setOffset(
        bodyFirstToken,
        isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
        forToken,
      )
    },
    FunctionDeclaration(
      node: ESTree.FunctionDeclaration | ESTree.FunctionExpression,
    ) {
      const firstToken = sourceCode.getFirstToken(node)
      let leftParenToken, bodyBaseToken
      if (firstToken.type === "Punctuator") {
        // method
        leftParenToken = firstToken
        bodyBaseToken = sourceCode.getFirstToken(getParent(node)!)
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

      if (
        !isOpeningParenToken(leftParenToken) &&
        (node as TSESTree.FunctionExpression).typeParameters
      ) {
        leftParenToken = sourceCode.getTokenAfter(
          (node as TSESTree.FunctionExpression).typeParameters!,
        )!
      }

      const rightParenToken = sourceCode.getTokenAfter(
        node.params[node.params.length - 1] || leftParenToken,
        { filter: isClosingParenToken, includeComments: false },
      )!
      const bodyToken = sourceCode.getFirstToken(node.body)

      setOffset(leftParenToken, 1, bodyBaseToken)
      setOffsetNodes(context, node.params, leftParenToken, rightParenToken, 1)
      setOffset(bodyToken, 0, bodyBaseToken)
    },
    FunctionExpression(node: ESTree.FunctionExpression) {
      visitor.FunctionDeclaration(node)
    },
    IfStatement(node: ESTree.IfStatement) {
      const [ifToken, ifLeftParenToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      const ifRightParenToken = sourceCode.getTokenBefore(node.consequent, {
        filter: isClosingParenToken,
        includeComments: false,
      })

      setOffset(ifLeftParenToken, 1, ifToken)
      setOffset(ifRightParenToken, 0, ifLeftParenToken)

      const consequentFirstToken = sourceCode.getFirstToken(node.consequent)
      setOffset(
        consequentFirstToken,
        isOpeningBraceToken(consequentFirstToken) ? 0 : 1,
        ifToken,
      )

      if (node.alternate != null) {
        const elseToken = sourceCode.getTokenAfter(node.consequent, {
          filter: isNotClosingParenToken,
          includeComments: false,
        })!

        setOffset(elseToken, 0, ifToken)

        const alternateFirstToken = sourceCode.getFirstToken(node.alternate)
        setOffset(
          alternateFirstToken,
          isOpeningBraceToken(alternateFirstToken) ? 0 : 1,
          elseToken,
        )
      }
    },
    ImportDeclaration(node: ESTree.ImportDeclaration) {
      const importToken = sourceCode.getFirstToken(node)
      const tokens = sourceCode.getTokensBetween(importToken, node.source)
      const fromIndex = tokens.map((t) => t.value).lastIndexOf("from")
      const { fromToken, beforeTokens, afterTokens } =
        fromIndex >= 0
          ? {
              fromToken: tokens[fromIndex],
              beforeTokens: tokens.slice(0, fromIndex),
              afterTokens: [
                ...tokens.slice(fromIndex + 1),
                sourceCode.getFirstToken(node.source),
              ],
            }
          : {
              fromToken: null,
              beforeTokens: [...tokens, sourceCode.getFirstToken(node.source)],
              afterTokens: [],
            }

      const namedSpecifiers: ESTree.ImportSpecifier[] = []
      for (const specifier of node.specifiers) {
        let removeTokens
        if (specifier.type === "ImportSpecifier") {
          namedSpecifiers.push(specifier)
          removeTokens = sourceCode.getTokens(specifier)
        } else {
          removeTokens = sourceCode.getTokens(specifier)
          removeTokens.shift()
        }
        for (const token of removeTokens) {
          const i = beforeTokens.indexOf(token)
          if (i >= 0) {
            beforeTokens.splice(i, 1)
          }
        }
      }
      if (namedSpecifiers.length) {
        const leftBrace = sourceCode.getTokenBefore(namedSpecifiers[0])!
        const rightBrace = sourceCode.getTokenAfter(
          namedSpecifiers[namedSpecifiers.length - 1],
        )
        setOffsetNodes(context, namedSpecifiers, leftBrace, rightBrace, 1)
      }

      if (
        beforeTokens.every(
          (t) => isOpeningBraceToken(t) || isClosingBraceToken(t),
        )
      ) {
        setOffset(beforeTokens, 0, importToken)
      } else {
        setOffset(beforeTokens, 1, importToken)
      }
      if (fromToken) {
        setOffset(fromToken, 0, importToken)
        setOffset(afterTokens, 1, fromToken)
      }
    },
    ImportExpression(node: ESTree.ImportExpression) {
      const firstToken = sourceCode.getFirstToken(node)
      const rightToken = sourceCode.getLastToken(node)
      const leftToken = sourceCode.getTokenAfter(firstToken, {
        filter: isOpeningParenToken,
        includeComments: false,
      })!

      setOffset(leftToken, 1, firstToken)
      setOffsetNodes(context, [node.source], leftToken, rightToken, 1)
    },
    ImportNamespaceSpecifier(node: ESTree.ImportNamespaceSpecifier) {
      const tokens = sourceCode.getTokens(node)
      const firstToken = tokens.shift()!
      setOffset(tokens, 1, firstToken)
    },
    ImportSpecifier(node: ESTree.ImportSpecifier) {
      if (node.local.range![0] !== node.imported.range![0]) {
        const tokens = sourceCode.getTokens(node)
        const firstToken = tokens.shift()!
        setOffset(tokens, 1, firstToken)
      }
    },
    LabeledStatement(
      node: ESTree.LabeledStatement | AST.SvelteReactiveStatement,
    ) {
      const labelToken = sourceCode.getFirstToken(node)
      const colonToken = sourceCode.getTokenAfter(labelToken)!
      const bodyToken = sourceCode.getTokenAfter(colonToken)

      setOffset([colonToken, bodyToken], 1, labelToken)
    },
    SvelteReactiveStatement(node: AST.SvelteReactiveStatement) {
      visitor.LabeledStatement(node)
    },
    MemberExpression(node: ESTree.MemberExpression | ESTree.MetaProperty) {
      const objectToken = sourceCode.getFirstToken(node)
      if (node.type === "MemberExpression" && node.computed) {
        const leftBracketToken = sourceCode.getTokenBefore(node.property, {
          filter: isOpeningBracketToken,
          includeComments: false,
        })!
        const rightBracketToken = sourceCode.getTokenAfter(node.property, {
          filter: isClosingBracketToken,
          includeComments: false,
        })

        for (const optionalToken of sourceCode.getTokensBetween(
          sourceCode.getLastToken(node.object),
          leftBracketToken,
          { filter: isOptionalToken, includeComments: false },
        )) {
          setOffset(optionalToken, 1, objectToken)
        }

        setOffset(leftBracketToken, 1, objectToken)
        setOffsetNodes(
          context,
          [node.property],
          leftBracketToken,
          rightBracketToken,
          1,
        )
      } else {
        const dotToken = sourceCode.getTokenBefore(node.property)!
        const propertyToken = sourceCode.getTokenAfter(dotToken)

        setOffset([dotToken, propertyToken], 1, objectToken)
      }
    },
    MetaProperty(node: ESTree.MetaProperty) {
      visitor.MemberExpression(node)
    },
    MethodDefinition(
      node:
        | ESTree.MethodDefinition
        | ESTree.Property
        | ESTree.PropertyDefinition,
    ) {
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

      if (
        node.type === "MethodDefinition" ||
        (node.type === "Property" && node.method === true)
      ) {
        const leftParenToken = sourceCode.getTokenAfter(lastKeyToken)
        setOffset(leftParenToken, 1, lastKeyToken)
      } else if (node.type === "Property" && !node.shorthand) {
        const colonToken = sourceCode.getTokenAfter(lastKeyToken)!
        const valueToken = sourceCode.getTokenAfter(colonToken)

        setOffset([colonToken, valueToken], 1, lastKeyToken)
      } else if (node.type === "PropertyDefinition" && node.value != null) {
        const eqToken = sourceCode.getTokenAfter(lastKeyToken)!
        const initToken = sourceCode.getTokenAfter(eqToken)

        setOffset([eqToken, initToken], 1, lastKeyToken)
      }
    },
    Property(node: ESTree.Property) {
      visitor.MethodDefinition(node)
    },
    NewExpression(node: ESTree.NewExpression) {
      const newToken = sourceCode.getFirstToken(node)
      const calleeTokens = getFirstAndLastTokens(sourceCode, node.callee)
      setOffset(calleeTokens.firstToken, 1, newToken)

      if (
        node.arguments.length ||
        calleeTokens.lastToken.range[1] < node.range![1]
      ) {
        const rightParenToken = sourceCode.getLastToken(node)
        const leftParenToken = sourceCode.getTokenAfter(calleeTokens.lastToken)!

        setOffset(leftParenToken, 1, calleeTokens.firstToken)
        setOffsetNodes(
          context,
          node.arguments,
          leftParenToken,
          rightParenToken,
          1,
        )
      }
    },
    ObjectExpression(node: ESTree.ObjectExpression | ESTree.ObjectPattern) {
      setOffsetNodes(
        context,
        node.properties,
        sourceCode.getFirstToken(node),
        sourceCode.getLastToken(node),
        1,
      )
    },
    ObjectPattern(node: ESTree.ObjectPattern) {
      visitor.ObjectExpression(node)
    },
    PropertyDefinition(node: ESTree.PropertyDefinition) {
      visitor.MethodDefinition(node)
    },
    ReturnStatement(node: ESTree.ReturnStatement | ESTree.ThrowStatement) {
      if (node.argument) {
        const firstToken = sourceCode.getFirstToken(node)
        const nextToken = sourceCode.getTokenAfter(firstToken)

        setOffset(nextToken, 1, firstToken)
      }
    },
    ThrowStatement(node: ESTree.ThrowStatement) {
      visitor.ReturnStatement(node)
    },
    SequenceExpression(node: ESTree.SequenceExpression) {
      const firstToken = sourceCode.getFirstToken(node)
      setOffsetNodes(context, node.expressions, firstToken, null, 0)
    },
    SwitchCase(node: ESTree.SwitchCase) {
      const caseToken = sourceCode.getFirstToken(node)
      if (node.test != null) {
        const testTokens = getFirstAndLastTokens(sourceCode, node.test)
        const colonToken = sourceCode.getTokenAfter(testTokens.lastToken)
        setOffset([testTokens.firstToken, colonToken], 1, caseToken)
      } else {
        const colonToken = sourceCode.getTokenAfter(caseToken)
        setOffset(colonToken, 1, caseToken)
      }

      if (
        node.consequent.length === 1 &&
        node.consequent[0].type === "BlockStatement"
      ) {
        setOffset(sourceCode.getFirstToken(node.consequent[0]), 0, caseToken)
      } else {
        for (const statement of node.consequent) {
          setOffset(
            getFirstAndLastTokens(sourceCode, statement).firstToken,
            1,
            caseToken,
          )
        }
      }
    },
    SwitchStatement(node: ESTree.SwitchStatement) {
      const switchToken = sourceCode.getFirstToken(node)
      const { firstToken: leftParenToken, lastToken: rightParenToken } =
        getFirstAndLastTokens(sourceCode, node.discriminant)
      const leftBraceToken = sourceCode.getTokenAfter(rightParenToken)!
      const rightBraceToken = sourceCode.getLastToken(node)

      setOffset(leftParenToken, 1, switchToken)
      setOffsetNodes(
        context,
        [node.discriminant],
        leftParenToken,
        rightParenToken,
        1,
      )
      setOffset(leftBraceToken, 0, switchToken)
      setOffsetNodes(
        context,
        node.cases,
        leftBraceToken,
        rightBraceToken,
        options.switchCase,
      )
    },
    TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression) {
      const tagTokens = getFirstAndLastTokens(sourceCode, node.tag)
      setOffset(sourceCode.getFirstToken(node.quasi), 1, tagTokens.firstToken)
    },
    TemplateLiteral(node: ESTree.TemplateLiteral) {
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
    TryStatement(node: ESTree.TryStatement) {
      const tryToken = sourceCode.getFirstToken(node)
      const tryBlockToken = sourceCode.getFirstToken(node.block)

      setOffset(tryBlockToken, 0, tryToken)

      if (node.handler != null) {
        const catchToken = sourceCode.getFirstToken(node.handler)
        setOffset(catchToken, 0, tryToken)
      }

      if (node.finalizer != null) {
        const finallyToken = sourceCode.getTokenBefore(node.finalizer)
        const finallyBlockToken = sourceCode.getFirstToken(node.finalizer)
        setOffset([finallyToken, finallyBlockToken], 0, tryToken)
      }
    },
    UpdateExpression(node: ESTree.UpdateExpression) {
      const firstToken = sourceCode.getFirstToken(node)
      const nextToken = sourceCode.getTokenAfter(firstToken)
      setOffset(nextToken, 1, firstToken)
    },
    VariableDeclaration(node: ESTree.VariableDeclaration) {
      setOffsetNodes(
        context,
        node.declarations,
        sourceCode.getFirstToken(node),
        null,
        1,
      )
    },
    VariableDeclarator(node: ESTree.VariableDeclarator) {
      if (node.init != null) {
        const idToken = sourceCode.getFirstToken(node)
        const eqToken = sourceCode.getTokenAfter(node.id)!
        const initToken = sourceCode.getTokenAfter(eqToken)

        setOffset([eqToken, initToken], 1, idToken)
      }
    },
    WhileStatement(node: ESTree.WhileStatement | ESTree.WithStatement) {
      const firstToken = sourceCode.getFirstToken(node)
      const leftParenToken = sourceCode.getTokenAfter(firstToken)!
      const rightParenToken = sourceCode.getTokenBefore(node.body, {
        filter: isClosingParenToken,
        includeComments: false,
      })!

      setOffset(leftParenToken, 1, firstToken)
      setOffset(rightParenToken, 0, leftParenToken)

      const bodyFirstToken = sourceCode.getFirstToken(node.body)
      setOffset(
        bodyFirstToken,
        isOpeningBraceToken(bodyFirstToken) ? 0 : 1,
        firstToken,
      )
    },
    WithStatement(node: ESTree.WithStatement) {
      visitor.WhileStatement(node)
    },
    YieldExpression(node: ESTree.YieldExpression) {
      if (node.argument != null) {
        const [yieldToken, secondToken] = sourceCode.getFirstTokens(node, {
          count: 2,
          includeComments: false,
        })

        setOffset(secondToken, 1, yieldToken)
        if (node.delegate) {
          setOffset(sourceCode.getTokenAfter(secondToken), 1, yieldToken)
        }
      }
    },

    // ----------------------------------------------------------------------
    // SINGLE TOKEN NODES
    // ----------------------------------------------------------------------
    DebuggerStatement() {
      // noop
    },
    EmptyStatement() {
      // noop
    },
    Identifier() {
      // noop
    },
    ImportDefaultSpecifier() {
      // noop
    },
    Literal() {
      // noop
    },
    PrivateIdentifier() {
      // noop
    },
    Super() {
      // noop
    },
    TemplateElement() {
      // noop
    },
    ThisExpression() {
      // noop
    },
    // ----------------------------------------------------------------------
    // WRAPPER NODES
    // ----------------------------------------------------------------------
    ExpressionStatement() {
      // noop
    },
    ChainExpression() {
      // noop
    },
  }

  return {
    ...visitor,
    ":statement"(node: ESTree.Statement) {
      const firstToken = sourceCode.getFirstToken(node)
      const lastToken = sourceCode.getLastToken(node)
      if (isSemicolonToken(lastToken) && firstToken !== lastToken) {
        const next = sourceCode.getTokenAfter(lastToken)
        if (!next || lastToken.loc.start.line < next.loc.start.line) {
          // End of line semicolons
          setOffset(lastToken, 0, firstToken)
        }
      }
    },
    ":expression"(node: ESTree.Expression) {
      // Proc parentheses.
      let leftToken = sourceCode.getTokenBefore(node)
      let rightToken = sourceCode.getTokenAfter(node)
      let firstToken = sourceCode.getFirstToken(node)

      while (
        leftToken &&
        isOpeningParenToken(leftToken) &&
        rightToken &&
        isClosingParenToken(rightToken)
      ) {
        setOffset(firstToken, 1, leftToken)
        setOffset(rightToken, 0, leftToken)

        firstToken = leftToken
        leftToken = sourceCode.getTokenBefore(leftToken)
        rightToken = sourceCode.getTokenAfter(rightToken)
      }
    },
  }
}

/** Get the parent node from the given node */
function getParent(node: ESTree.Node): ESTree.Node | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  return (node as any).parent || null
}

/**
 * Checks whether given text is known button type
 */
function isOptionalToken(token: { type: string; value: string }): boolean {
  return token.type === "Punctuator" && token.value === "?."
}
