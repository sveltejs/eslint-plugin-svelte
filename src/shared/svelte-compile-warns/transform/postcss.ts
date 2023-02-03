import type { AST } from "svelte-eslint-parser"
import postcss from "postcss"
import postcssLoadConfig from "postcss-load-config"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"

/**
 * Transform with postcss
 */
export function transform(
  node: AST.SvelteStyleElement,
  text: string,
  context: RuleContext,
): TransformResult | null {
  const postcssConfig = context.settings?.svelte?.compileOptions?.postcss
  if (postcssConfig === false) {
    return null
  }
  let inputRange: AST.Range
  if (node.endTag) {
    inputRange = [node.startTag.range[1], node.endTag.range[0]]
  } else {
    inputRange = [node.startTag.range[1], node.range[1]]
  }
  const code = text.slice(...inputRange)

  const filename = `${context.getFilename()}.css`
  try {
    const configFilePath = postcssConfig?.configFilePath

    const config = postcssLoadConfig.sync(
      {
        cwd: context.getCwd?.() ?? process.cwd(),
        from: filename,
      },
      typeof configFilePath === "string" ? configFilePath : undefined,
    )

    const result = postcss(config.plugins).process(code, {
      ...config.options,
      map: {
        inline: false,
      },
    })

    return {
      inputRange,
      output: result.content,
      mappings: result.map.toJSON().mappings,
    }
  } catch (_e) {
    // console.log(e)
    return null
  }
}
