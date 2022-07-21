import { createRule } from "../utils"
import type { AST } from "svelte-eslint-parser"

export default createRule("no-spaces-around-equal-signs-in-attribute", {
  meta: {
    docs: {
      description: "disallow spaces around equal signs in attribute",
      category: "Stylistic Issues",
      recommended: false,
      conflictWithPrettier: true,
    },
    schema: {},
    fixable: "code",
    messages: {
      noSpaces: "Unexpected spaces found around equal signs.",
    },
    type: "layout",
  },
  create(ctx) {
    const source = ctx.getSourceCode()

    /**
     * Returns source text between attribute key and value, and range of that source
     */
    function getAttrEq(node: AST.SvelteAttribute): [string, AST.Range] {
      const attrSource = source.getText(node)
      const keyRange = node.key.range
      const index =
        /[^\s=]/.exec(attrSource.slice(keyRange[1] - keyRange[0]))?.index ?? 0
      const valueStart = keyRange[1] + index
      const eqSource = attrSource.slice(
        keyRange[1] - keyRange[0],
        valueStart - keyRange[0],
      )

      return [eqSource, [keyRange[1], keyRange[1] + eqSource.length]]
    }

    /**
     * Returns true if string contains whitespace characters
     */
    function containsWhitespace(string: string): boolean {
      return /.*\s.*/s.test(string)
    }

    return {
      SvelteAttribute(node: AST.SvelteAttribute) {
        const [eqSource, range] = getAttrEq(node)

        if (!containsWhitespace(eqSource)) return

        const loc = {
          start: source.getLocFromIndex(range[0]),
          end: source.getLocFromIndex(range[1]),
        }

        ctx.report({
          loc,
          messageId: "noSpaces",
          *fix(fixer) {
            yield fixer.replaceTextRange(range, "=")
          },
        })
      },
    }
  },
})
