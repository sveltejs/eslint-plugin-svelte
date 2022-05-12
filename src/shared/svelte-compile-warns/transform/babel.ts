import type { AST } from "svelte-eslint-parser"
import Module from "module"
import path from "path"
import type babelCore from "@babel/core"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"

type BabelCore = typeof babelCore
const cacheBabel = new WeakMap<AST.SvelteProgram, BabelCore>()
/**
 * Transpile with babel
 */
export function transform(
  node: AST.SvelteScriptElement,
  context: RuleContext,
): TransformResult | null {
  const babel = loadBabel(context)
  if (!babel) {
    return null
  }
  let inputRange: AST.Range
  if (node.endTag) {
    inputRange = [node.startTag.range[1], node.endTag.range[0]]
  } else {
    inputRange = [node.startTag.range[1], node.range[1]]
  }
  const code = context.getSourceCode().text.slice(...inputRange)

  try {
    const output = babel.transformSync(code, {
      sourceType: "module",
      sourceMaps: true,
      minified: false,
      ast: false,
      code: true,
      cwd: context.getCwd?.() ?? process.cwd(),
    })
    if (!output) {
      return null
    }
    return {
      inputRange,
      output: output.code!,
      mappings: output.map!.mappings,
    }
  } catch (e) {
    return null
  }
}

/** Check if project has Babel. */
export function hasBabel(context: RuleContext): boolean {
  return Boolean(loadBabel(context))
}

/**
 * Load babel
 */
function loadBabel(context: RuleContext) {
  const key = context.getSourceCode().ast
  const babel = cacheBabel.get(key)
  if (babel) {
    return babel
  }
  try {
    const createRequire: (filename: string) => (modName: string) => unknown =
      // Added in v12.2.0
      Module.createRequire ||
      // Added in v10.12.0, but deprecated in v12.2.0.
      // @ts-expect-error -- old type
      Module.createRequireFromPath

    const cwd = context.getCwd?.() ?? process.cwd()
    const relativeTo = path.join(cwd, "__placeholder__.js")
    const babel = createRequire(relativeTo)("@babel/core") as BabelCore
    cacheBabel.set(key, babel)
    return babel
  } catch {
    return null
  }
}
