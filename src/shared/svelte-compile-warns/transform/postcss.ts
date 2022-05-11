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
  context: RuleContext,
): TransformResult | null {
  let inputRange: AST.Range
  if (node.endTag) {
    inputRange = [node.startTag.range[1], node.endTag.range[0]]
  } else {
    inputRange = [node.startTag.range[1], node.range[1]]
  }
  const code = context.getSourceCode().text.slice(...inputRange)

  const filename = `${context.getFilename()}.css`
  try {
    const configFilePath =
      context.settings?.["@ota-meshi/svelte"]?.compileOptions?.postcss
        ?.configFilePath

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
  } catch (e) {
    // console.log(e)
    return null
  }
}
