import { createRule } from "../utils"
import { getLangValue } from "../utils/ast-utils"
import type {
  SvelteScriptElement,
  SvelteStyleElement,
} from "svelte-eslint-parser/lib/ast"

export default createRule("block-lang", {
  meta: {
    docs: {
      description:
        "disallows the use of languages other than those specified in the configuration for the lang attribute of svelte elements `<script>` and `<style>`.",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          script: {
            oneOf: [
              {
                type: ["string", "null"],
              },
              {
                type: "array",
                items: {
                  type: ["string", "null"],
                },
                minItems: 1,
              },
            ],
          },
          style: {
            oneOf: [
              {
                type: ["string", "null"],
              },
              {
                type: "array",
                items: {
                  type: ["string", "null"],
                },
                minItems: 1,
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const scriptOption: string | null | (string | null)[] =
      context.options[0]?.script ?? null
    const allowedScriptLangs: (string | null)[] = Array.isArray(scriptOption)
      ? scriptOption
      : [scriptOption]
    let scriptLang: string | null = null
    let scriptNode: SvelteScriptElement | undefined = undefined

    const styleOption: string | null | (string | null)[] =
      context.options[0]?.style ?? null
    const allowedStyleLangs: (string | null)[] = Array.isArray(styleOption)
      ? styleOption
      : [styleOption]
    let styleLang: string | null = null
    let styleNode: SvelteStyleElement | undefined = undefined

    return {
      SvelteScriptElement(node) {
        scriptNode = node
        scriptLang = getLangValue(node)?.toLowerCase() ?? null
      },
      SvelteStyleElement(node) {
        styleNode = node
        styleLang = getLangValue(node)?.toLowerCase() ?? null
      },
      "Program:exit"() {
        if (!allowedScriptLangs.includes(scriptLang)) {
          if (scriptNode !== undefined) {
            context.report({
              node: scriptNode,
              message: `The lang attribute of the <script> block should be ${prettyPrintLangs(
                allowedScriptLangs,
              )}.`,
            })
          } else {
            context.report({
              loc: { line: 1, column: 1 },
              message: `The <script> block should be present and its lang attribute should be ${prettyPrintLangs(
                allowedScriptLangs,
              )}.`,
            })
          }
        }
        if (!allowedStyleLangs.includes(styleLang)) {
          if (styleNode !== undefined) {
            context.report({
              node: styleNode,
              message: `The lang attribute of the <style> block should be ${prettyPrintLangs(
                allowedStyleLangs,
              )}.`,
            })
          } else {
            context.report({
              loc: { line: 1, column: 1 },
              message: `The <style> block should be present and its lang attribute should be ${prettyPrintLangs(
                allowedStyleLangs,
              )}.`,
            })
          }
        }
      },
    }
  },
})

/**
 * Prints the list of allowed languages, with special handling of the `null` option.
 */
function prettyPrintLangs(langs: (string | null)[]): string {
  const hasNull = langs.includes(null)
  const nonNullLangs = langs.filter((lang) => lang !== null)
  if (nonNullLangs.length === 0) {
    // No special behaviour for `hasNull`, because that can never happen.
    return "omitted"
  }
  const hasNullText = hasNull ? "either omitted or " : ""
  const nonNullText =
    nonNullLangs.length === 1
      ? `"${nonNullLangs[0]}"`
      : `one of ${nonNullLangs.map((lang) => `"${lang}"`).join(", ")}`
  return hasNullText + nonNullText
}
