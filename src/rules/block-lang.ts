import { createRule } from "../utils"
import { getLangValue } from "../utils/ast-utils"
import type {
  SvelteScriptElement,
  SvelteStyleElement,
} from "svelte-eslint-parser/lib/ast"

export default createRule("block-lang", {
  meta: {
    docs: {
      description: "require type parameters for `createEventDispatcher`", // TODO
      category: "Best Practices", // TODO
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
    messages: {
      missingTypeParameter: `Type parameters missing for the \`createEventDispatcher\` function call.`, // TODO
    },
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
            context.report({ node: scriptNode, message: "TODO" })
          } else {
            context.report({ loc: { line: 1, column: 1 }, message: "TODO" })
          }
        }
        if (!allowedStyleLangs.includes(styleLang)) {
          if (styleNode !== undefined) {
            context.report({ node: styleNode, message: "TODO" })
          } else {
            context.report({ loc: { line: 1, column: 1 }, message: "TODO" })
          }
        }
      },
    }
  },
})
