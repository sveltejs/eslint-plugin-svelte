import { createRule } from "../utils"
import { getLangValue } from "../utils/ast-utils"

export default createRule("experimental-require-slot-types", {
  meta: {
    docs: {
      description:
        "require slot type declaration using the `$$Slots` interface",
      category: "Experimental",
      recommended: false,
    },
    schema: [],
    messages: {
      missingSlotsInterface: `The component must define the $$Slots interface.`,
    },
    type: "suggestion",
  },
  create(context) {
    let isTs = false
    let hasSlot = false
    let hasInterface = false
    return {
      SvelteScriptElement(node) {
        const lang = getLangValue(node)?.toLowerCase()
        isTs = lang === "ts" || lang === "typescript"
      },
      SvelteElement(node) {
        if (node.name.type === "SvelteName" && node.name.name === "slot") {
          hasSlot = true
        }
      },
      TSInterfaceDeclaration(node) {
        if (node.id.name === "$$Slots") {
          hasInterface = true
        }
      },
      "Program:exit"() {
        if (isTs && hasSlot && !hasInterface) {
          context.report({
            loc: {
              line: 1,
              column: 1,
            },
            messageId: "missingSlotsInterface",
          })
        }
      },
    }
  },
})
