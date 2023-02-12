import type { AST } from "svelte-eslint-parser"
import type typescript from "typescript"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"
import { loadModule } from "../../../utils/load-module"

type TS = typeof typescript
/**
 * Transpile with typescript
 */
export function transform(
  node: AST.SvelteScriptElement,
  text: string,
  context: RuleContext,
): TransformResult | null {
  const ts = loadTs(context)
  if (!ts) {
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
    const output = ts.transpileModule(code, {
      reportDiagnostics: false,
      compilerOptions: {
        target: context.parserOptions.target || ts.ScriptTarget.ESNext,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
        sourceMap: true,
      },
    })

    return {
      inputRange,
      output: output.outputText,
      mappings: JSON.parse(output.sourceMapText!).mappings,
    }
  } catch {
    return null
  }
}

/** Check if project has TypeScript. */
export function hasTypeScript(context: RuleContext): boolean {
  return Boolean(loadTs(context))
}

/**
 * Load typescript
 */
function loadTs(context: RuleContext): TS | null {
  return loadModule(context, "typescript")
}
