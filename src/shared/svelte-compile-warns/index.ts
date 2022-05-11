import type { AST } from "svelte-eslint-parser"
import * as compiler from "svelte/compiler"
import type { SourceMapMappings } from "sourcemap-codec"
import { decode } from "sourcemap-codec"
import type { RuleContext } from "../../types"
import { LinesAndColumns } from "../../utils/lines-and-columns"
import type { TransformResult } from "./transform/types"
import { transform as transformWithTypescript } from "./transform/typescript"
import { transform as transformWithPostCSS } from "./transform/postcss"

export type Loc = {
  start?: {
    line: number
    column: number
  }
  end?: {
    line: number
    column: number
  }
}
export type Warning = {
  code?: string
  message: string
} & Loc
export type GetSvelteWarningsOption = {
  removeComments?: Iterable<AST.Token | AST.Comment>
}

/**
 * Get svelte compile warnings
 */
export function getSvelteCompileWarnings(
  context: RuleContext,
  option: GetSvelteWarningsOption,
): {
  warnings: Warning[]
  kind: "warn" | "error"
  stripStyleElements: AST.SvelteStyleElement[]
} {
  const sourceCode = context.getSourceCode()

  // Process for styles
  const styleElementsWithNotCSS = [
    ...extractStyleElementsWithLangOtherThanCSS(context),
  ]
  const stripStyleElements: AST.SvelteStyleElement[] = []
  const transformResults: TransformResult[] = []
  for (const style of styleElementsWithNotCSS) {
    if (style.lang === "postcss") {
      const result = transformWithPostCSS(style.node, context)
      if (result) {
        transformResults.push(result)
        continue
      }
    }
    stripStyleElements.push(style.node)
  }

  const stripStyleTokens = stripStyleElements.flatMap((e) => e.children)

  const stripTokens: (AST.Token | AST.Comment | AST.SvelteText)[] =
    option.removeComments
      ? [...option.removeComments, ...stripStyleTokens]
      : stripStyleTokens

  const text = buildStrippedText(context, stripTokens)

  if (context.parserServices.esTreeNodeToTSNodeMap) {
    const root = sourceCode.ast

    for (const node of root.body) {
      if (node.type === "SvelteScriptElement") {
        const result = transformWithTypescript(node, context)
        if (result) {
          transformResults.push(result)
        }
      }
    }
  }

  if (!transformResults.length) {
    const warnings = getWarningsFromCode(text)
    return { ...warnings, stripStyleElements }
  }

  class RemapContext {
    private originalStart = 0

    private code = ""

    private locs: LinesAndColumns | null = null

    private readonly mapIndexes: {
      range: [number, number]
      remap: (index: number) => number
    }[] = []

    public appendOriginal(endIndex: number) {
      const codeStart = this.code.length
      const start = this.originalStart
      this.code += text.slice(start, endIndex)
      this.originalStart = endIndex
      const offset = start - codeStart
      this.mapIndexes.push({
        range: [codeStart, this.code.length],
        remap(index) {
          return index + offset
        },
      })
    }

    public postprocess(): string {
      this.appendOriginal(text.length)
      return this.code
    }

    public appendTranspile(output: TransformResult) {
      const endIndex: number = output.inputRange[1]
      const codeStart = this.code.length
      const start = this.originalStart
      const inputText = text.slice(start, endIndex)

      const outputText = `${output.output}\n`

      this.code += outputText
      this.originalStart = endIndex

      let outputLocs: LinesAndColumns | null = null
      let inputLocs: LinesAndColumns | null = null
      let decoded: SourceMapMappings | null = null
      this.mapIndexes.push({
        range: [codeStart, this.code.length],
        remap: (index) => {
          outputLocs = outputLocs ?? new LinesAndColumns(outputText)
          inputLocs = inputLocs ?? new LinesAndColumns(inputText)
          const outputCodePos = outputLocs.getLocFromIndex(index - codeStart)
          const inputCodePos = remapPosition(outputCodePos)
          return inputLocs.getIndexFromLoc(inputCodePos) + start
        },
      })

      /** Remapping source position */
      function remapPosition(pos: { line: number; column: number }): {
        line: number
        column: number
      } {
        decoded = decoded ?? decode(output.mappings)

        const lineMaps = decoded[pos.line - 1]

        if (!lineMaps?.length) {
          for (let line = pos.line - 1; line >= 0; line--) {
            const prevLineMaps = decoded[line]
            if (prevLineMaps?.length) {
              const [, , sourceCodeLine, sourceCodeColumn] =
                prevLineMaps[prevLineMaps.length - 1]
              return {
                line: sourceCodeLine! + 1,
                column: sourceCodeColumn!,
              }
            }
          }
          return { line: -1, column: -1 }
        }

        for (let index = 0; index < lineMaps.length - 1; index++) {
          const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] =
            lineMaps[index]
          if (
            generateCodeColumn <= pos.column &&
            pos.column < lineMaps[index + 1][0]
          ) {
            return {
              line: sourceCodeLine! + 1,
              column: sourceCodeColumn! + (pos.column - generateCodeColumn),
            }
          }
        }
        const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] =
          lineMaps[lineMaps.length - 1]
        return {
          line: sourceCodeLine! + 1,
          column: sourceCodeColumn! + (pos.column - generateCodeColumn),
        }
      }
    }

    public remapLocs(points: {
      start?: {
        line: number
        column: number
      }
      end?: {
        line: number
        column: number
      }
    }): {
      start?: {
        line: number
        column: number
      }
      end?: {
        line: number
        column: number
      }
    } {
      const mapIndexes = this.mapIndexes
      const locs = (this.locs = this.locs ?? new LinesAndColumns(this.code))
      let start:
        | {
            line: number
            column: number
          }
        | undefined = undefined
      let end:
        | {
            line: number
            column: number
          }
        | undefined = undefined
      if (points.start) {
        const index = locs.getIndexFromLoc(points.start)
        const remapped = remapIndex(index)
        if (remapped) {
          start = sourceCode.getLocFromIndex(remapped)
        }
      }
      if (points.end) {
        const index = locs.getIndexFromLoc(points.end)
        const remapped = remapIndex(index - 1 /* include index */)
        if (remapped) {
          end = sourceCode.getLocFromIndex(remapped + 1 /* restore */)
        }
      }

      return { start, end }

      /** remap index */
      function remapIndex(index: number) {
        for (const mapIndex of mapIndexes) {
          if (mapIndex.range[0] <= index && index < mapIndex.range[1]) {
            return mapIndex.remap(index)
          }
        }
        return null
      }
    }
  }

  const remapContext = new RemapContext()

  for (const result of transformResults.sort(
    (a, b) => a.inputRange[0] - b.inputRange[0],
  )) {
    remapContext.appendOriginal(result.inputRange[0])
    remapContext.appendTranspile(result)
  }

  const code = remapContext.postprocess()
  const baseWarnings = getWarningsFromCode(code)

  const warnings: Warning[] = []
  for (const warn of baseWarnings.warnings) {
    let loc: Loc | null = null

    /** Get re-mapped location */
    // eslint-disable-next-line func-style -- ignore
    const getLoc = function getLoc() {
      if (loc) {
        return loc
      }
      return (loc = remapContext.remapLocs(warn))
    }

    warnings.push({
      code: warn.code,
      message: warn.message,
      get start() {
        return getLoc().start
      },
      get end() {
        return getLoc().end
      },
    })
  }

  return { warnings, kind: baseWarnings.kind, stripStyleElements }
}

/**
 * Extracts the style with the lang attribute other than CSS.
 */
function* extractStyleElementsWithLangOtherThanCSS(
  context: RuleContext,
): Iterable<{
  node: AST.SvelteStyleElement
  lang: string
}> {
  const sourceCode = context.getSourceCode()
  const root = sourceCode.ast
  for (const node of root.body) {
    if (node.type === "SvelteStyleElement") {
      const langAttr = node.startTag.attributes.find(
        (attr): attr is AST.SvelteAttribute =>
          attr.type === "SvelteAttribute" && attr.key.name === "lang",
      )
      if (
        langAttr &&
        langAttr.value.length === 1 &&
        langAttr.value[0].type === "SvelteLiteral" &&
        langAttr.value[0].value.toLowerCase() !== "css"
      ) {
        yield { node, lang: langAttr.value[0].value.toLowerCase() }
      }
    }
  }
}

/**
 * Build the text stripped of tokens that are not needed for compilation.
 */
function buildStrippedText(
  context: RuleContext,
  stripTokens: (AST.Token | AST.Comment | AST.SvelteText)[],
) {
  const sourceCode = context.getSourceCode()
  const baseText = sourceCode.text

  if (!stripTokens.length) {
    return baseText
  }

  let code = ""
  let start = 0
  for (const token of stripTokens.sort((a, b) => a.range[0] - b.range[0])) {
    code +=
      baseText.slice(start, token.range[0]) +
      baseText.slice(...token.range).replace(/[^\t\n\r ]/g, " ")
    start = token.range[1]
  }
  code += baseText.slice(start)
  return code
}

/**
 * Get compile warnings
 */
function getWarningsFromCode(code: string): {
  warnings: Warning[]
  kind: "warn" | "error"
} {
  try {
    const result = compiler.compile(code, {
      generate: false,
    })

    return { warnings: result.warnings as Warning[], kind: "warn" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  } catch (e: any) {
    return {
      warnings: [
        {
          code: e.code,
          message: e.message,
          start: e.start,
          end: e.end,
        },
      ],
      kind: "error",
    }
  }
}
