import { createRule } from "../utils"
import type { AST } from "svelte-eslint-parser"

export default createRule("no-spaces-around-equal-signs-in-attribute", {
  meta: {
    docs: {
      description: "Disallow spaces around equal signs in attribute",
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
     *
     */
    function getAttrEq(node: AST.SvelteAttribute): [string, AST.Range] {
      const attrSource = source.getText(node)
      const keyRange = node.key.range
      const valueStart = node.value?.[0]?.range?.[0] ?? keyRange[1]
      let eqSource = attrSource.slice(
        keyRange[1] - keyRange[0],
        valueStart - keyRange[0],
      )

      if (['"', "'"].includes(eqSource[eqSource.length - 1]))
        eqSource = eqSource.slice(0, eqSource.length - 1)
      return [eqSource, [keyRange[1], keyRange[1] + eqSource.length]]
    }

    /**
     *
     */
    function containsSpaces(string: string): boolean {
      return /.*\s.*/s.test(string)
    }

    return {
      SvelteAttribute(node: AST.SvelteAttribute) {
        const [eqSource, range] = getAttrEq(node)

        if (!containsSpaces(eqSource)) return

        const loc = {
          start: source.getLocFromIndex(range[0]),
          end: source.getLocFromIndex(range[1] - 1),
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
