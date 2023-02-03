import type { AST } from "svelte-eslint-parser"
import type sass from "sass"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"
import { loadModule } from "../../../utils/load-module"

type Sass = typeof sass
/**
 * Transpile with sass
 */
export function transform(
  node: AST.SvelteStyleElement,
  text: string,
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
  const code = text.slice(...inputRange)

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
  } catch (_e) {
    return null
  }
}

/**
 * Load sass
 */
function loadSass(context: RuleContext): Sass | null {
  return loadModule(context, "sass")
}
