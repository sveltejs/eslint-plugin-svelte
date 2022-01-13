import { AST_NODE_TYPES } from "@typescript-eslint/types"
import { parseForESLint } from "svelte-eslint-parser"
import path from "path"
import fs from "fs"

// import { fileURLToPath } from "url"
// const filename = fileURLToPath(import.meta.url)
const dirname = __dirname // path.dirname(filename)
const codeFilename = path.join(dirname, "../src/types-for-node.ts")
const { visitorKeys } = parseForESLint("")

const esNextNodeNames = ["Decorator", "ImportAttribute", "StaticBlock"]
const esSvelteNodeNames = ["Program", "SvelteReactiveStatement"]
const tsEsNodeNames = Object.keys(AST_NODE_TYPES).filter((k) => k !== "Program")
const esNodeNames = tsEsNodeNames.filter(
  (k) =>
    !k.startsWith("TS") && !k.startsWith("JSX") && !esNextNodeNames.includes(k),
)
const tsNodeNames = tsEsNodeNames.filter(
  (k) => !k.startsWith("JSX") && !esNodeNames.includes(k),
)
const svelteNodeNames = Object.keys(visitorKeys).filter(
  (k) => !tsEsNodeNames.includes(k) && !k.startsWith("Experimental"),
)

let code = `import type { TSESTree, AST_NODE_TYPES } from "@typescript-eslint/types";
import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"

export type ASTNode =
  | AST.SvelteNode
  | ESTree.Node
  | Exclude<TSESTree.Node, { type: ESTree.Node["type"] }>
export type ASTNodeWithParent =
  | (Exclude<ASTNode, ESTree.Program> & { parent: ASTNodeWithParent })
  | AST.SvelteProgram

export type ASTNodeListener = {
`
for (const nodeType of tsEsNodeNames) {
  let argType = `TSESTree.${nodeType}`
  if (nodeType === "TSIntrinsicKeyword") {
    argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
for (const nodeType of svelteNodeNames) {
  let argType = `AST.${nodeType}`
  if (nodeType === "Program") {
    argType = `AST.SvelteProgram`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type ESNodeListener = {
`
for (const nodeType of esNodeNames) {
  const argType = `ESTree.${nodeType}`
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
for (const nodeType of esSvelteNodeNames) {
  let argType = `AST.${nodeType}`
  if (nodeType === "Program") {
    argType = `AST.SvelteProgram`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type TSNodeListener = {
`
for (const nodeType of tsNodeNames) {
  let argType = `TSESTree.${nodeType}`
  if (nodeType === "TSIntrinsicKeyword") {
    argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type SvelteNodeListener = {
`
for (const nodeType of svelteNodeNames.filter(
  (k) => !esSvelteNodeNames.includes(k),
)) {
  const argType = `AST.${nodeType}`
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

fs.writeFileSync(codeFilename, code)
