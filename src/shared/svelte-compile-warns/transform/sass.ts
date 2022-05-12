import type { AST } from "svelte-eslint-parser"
import Module from "module"
import path from "path"
import type sass from "sass"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"

type Sass = typeof sass
const cacheSass = new WeakMap<AST.SvelteProgram, Sass>()
/**
 * Transpile with sass
 */
export function transform(
  node: AST.SvelteStyleElement,
  context: RuleContext,
  type: "scss" | "sass",
): TransformResult | null {
  const sass = loadSass(context)
  if (!sass) {
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
    const output = sass.compileString(code, {
      sourceMap: true,
      syntax: type === "sass" ? "indented" : undefined,
    })
    if (!output) {
      return null
    }
    return {
      inputRange,
      output: output.css,
      mappings: output.sourceMap!.mappings,
    }
  } catch (e) {
    return null
  }
}

/**
 * Load sass
 */
function loadSass(context: RuleContext) {
  const key = context.getSourceCode().ast
  const sass = cacheSass.get(key)
  if (sass) {
    return sass
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
    const sass = createRequire(relativeTo)("sass") as Sass
    cacheSass.set(key, sass)
    return sass
  } catch {
    return null
  }
}
