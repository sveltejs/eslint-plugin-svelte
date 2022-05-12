import type { AST } from "svelte-eslint-parser"
import * as compiler from "svelte/compiler"
import type { SourceMapMappings } from "sourcemap-codec"
import { decode } from "sourcemap-codec"
import type { RuleContext } from "../../types"
import { LinesAndColumns } from "../../utils/lines-and-columns"
import type { TransformResult } from "./transform/types"
import {
  hasTypeScript,
  transform as transformWithTypescript,
} from "./transform/typescript"
import { hasBabel, transform as transformWithBabel } from "./transform/babel"
import { transform as transformWithPostCSS } from "./transform/postcss"
import type { IgnoreItem } from "./ignore-comment"
import { getSvelteIgnoreItems } from "./ignore-comment"
import { extractLeadingComments } from "./extract-leading-comments"
import { getLangValue } from "../../utils/ast-utils"

const CSS_WARN_CODES = new Set([
  "css-unused-selector",
  "css-invalid-global",
  "css-invalid-global-selector",
])
const cacheAll = new WeakMap<AST.SvelteProgram, SvelteCompileWarnings>()
export type SvelteCompileWarnings = {
  warnings: Warning[]
  unusedIgnores: IgnoreItem[]
  kind: "warn" | "error"
  stripStyleElements: AST.SvelteStyleElement[]
}
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

/**
 * Get svelte compile warnings
 */
export function getSvelteCompileWarnings(
  context: RuleContext,
): SvelteCompileWarnings {
  const sourceCode = context.getSourceCode()
  const cache = cacheAll.get(sourceCode.ast)
  if (cache) {
    return cache
  }
  const result = getSvelteCompileWarningsWithoutCache(context)
  cacheAll.set(sourceCode.ast, result)
  return result
}

/**
 * Get svelte compile warnings
 */
function getSvelteCompileWarningsWithoutCache(
  context: RuleContext,
): SvelteCompileWarnings {
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
  const ignoreComments = getSvelteIgnoreItems(context).filter(
    (item): item is IgnoreItem => item.code != null,
  )

  const text = buildStrippedText(context, ignoreComments, stripStyleTokens)

  transformResults.push(...transformScripts(context))

  if (!transformResults.length) {
    const warnings = getWarningsFromCode(text)
    return {
      ...processIgnore(
        warnings.warnings,
        warnings.kind,
        stripStyleElements,
        ignoreComments,
        context,
      ),
      kind: warnings.kind,
      stripStyleElements,
    }
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

  return {
    ...processIgnore(
      warnings,
      baseWarnings.kind,
      stripStyleElements,
      ignoreComments,
      context,
    ),
    kind: baseWarnings.kind,
    stripStyleElements,
  }
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
      const lang = getLangValue(node)
      if (lang != null && lang.toLowerCase() !== "css") {
        yield { node, lang: lang.toLowerCase() }
      }
    }
  }
}

/**
 * Build the text stripped of tokens that are not needed for compilation.
 */
function buildStrippedText(
  context: RuleContext,
  ignoreComments: IgnoreItem[],
  stripStyleTokens: AST.SvelteText[],
) {
  const sourceCode = context.getSourceCode()
  const baseText = sourceCode.text

  const stripTokens = new Set([
    ...ignoreComments.map((item) => item.token),
    ...stripStyleTokens,
  ])
  if (!stripTokens.size) {
    return baseText
  }

  let code = ""
  let start = 0
  for (const token of [...stripTokens].sort(
    (a, b) => a.range[0] - b.range[0],
  )) {
    code +=
      baseText.slice(start, token.range[0]) +
      baseText.slice(...token.range).replace(/[^\t\n\r ]/g, " ")
    start = token.range[1]
  }
  code += baseText.slice(start)
  return code
}

/** Returns the result of transforming the required script for the transform. */
function* transformScripts(context: RuleContext) {
  const transform = isUseTypeScript(context)
    ? hasTypeScript(context)
      ? transformWithTypescript
      : hasBabel(context)
      ? transformWithBabel
      : null
    : context.settings?.["@ota-meshi/svelte"]?.compileOptions?.babel &&
      hasBabel(context)
    ? transformWithBabel
    : null

  const sourceCode = context.getSourceCode()
  if (transform) {
    const root = sourceCode.ast
    for (const node of root.body) {
      if (node.type === "SvelteScriptElement") {
        const result = transform(node, context)
        if (result) {
          yield result
        }
      }
    }
  }
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

/** Ignore process */
function processIgnore(
  warnings: Warning[],
  kind: "warn" | "error",
  stripStyleElements: AST.SvelteStyleElement[],
  ignoreComments: IgnoreItem[],
  context: RuleContext,
): {
  warnings: Warning[]
  unusedIgnores: IgnoreItem[]
} {
  if (kind === "error") {
    return {
      warnings,
      unusedIgnores: ignoreComments,
    }
  }
  const sourceCode = context.getSourceCode()
  const unusedIgnores = new Set(ignoreComments)
  const remainingWarning = new Set(warnings)

  for (const warning of warnings) {
    if (!warning.code) {
      continue
    }
    const node = getWarningNode(warning)
    if (!node) {
      continue
    }
    for (const comment of extractLeadingComments(context, node).reverse()) {
      const ignoreItem = ignoreComments.find(
        (item) => item.token === comment && item.code === warning.code,
      )
      if (ignoreItem) {
        unusedIgnores.delete(ignoreItem)
        remainingWarning.delete(warning)
        break
      }
    }
  }
  // Stripped styles are ignored from compilation and cannot determine css errors.
  for (const node of stripStyleElements) {
    for (const comment of extractLeadingComments(context, node).reverse()) {
      const ignoreItem = ignoreComments.find(
        (item) => item.token === comment && CSS_WARN_CODES.has(item.code),
      )
      if (ignoreItem) {
        unusedIgnores.delete(ignoreItem)
        break
      }
    }
  }
  return {
    warnings: [...remainingWarning],
    unusedIgnores: [...unusedIgnores],
  }

  /** Get warning node */
  function getWarningNode(warning: Warning) {
    const index = getWarningIndex(warning)
    if (index == null) {
      return null
    }
    let targetNode = sourceCode.getNodeByRangeIndex(index)
    while (targetNode) {
      if (
        targetNode.type === "SvelteElement" ||
        targetNode.type === "SvelteStyleElement"
      ) {
        return targetNode
      }
      if (targetNode.parent) {
        if (
          targetNode.parent.type === "Program" ||
          targetNode.parent.type === "SvelteScriptElement"
        ) {
          return targetNode
        }
      } else {
        return null
      }
      targetNode = targetNode.parent || null
    }

    return null
  }

  /** Get warning index */
  function getWarningIndex(warning: Warning) {
    const start = warning.start && sourceCode.getIndexFromLoc(warning.start)
    const end = warning.end && sourceCode.getIndexFromLoc(warning.end)
    if (start != null && end != null) {
      return Math.floor(start + (end - start) / 2)
    }
    return start ?? end
  }
}

/**
 * Check if using TypeScript.
 */
function isUseTypeScript(context: RuleContext) {
  if (context.parserServices.esTreeNodeToTSNodeMap) return true
  const sourceCode = context.getSourceCode()
  const root = sourceCode.ast

  for (const node of root.body) {
    if (node.type === "SvelteScriptElement") {
      const lang = getLangValue(node)?.toLowerCase()
      if (lang === "ts" || lang === "typescript") {
        return true
      }
    }
  }
  return false
}
