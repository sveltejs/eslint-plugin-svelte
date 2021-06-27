import { createRule } from "../utils"

export default createRule("shorthand-attribute", {
  meta: {
    docs: {
      description: "enforce use of shorthand syntax in attribute",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          prefer: { enum: ["always", "never"] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedShorthand: "Expected shorthand attribute.",
      expectedRegular: "Expected regular attribute syntax.",
    },
    type: "layout", // "problem", or "layout",
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    const always: boolean = context.options[0]?.prefer !== "never"

    return always
      ? {
          SvelteAttribute(node) {
            if (node.value.length !== 1) {
              return
            }
            const value = node.value[0]
            if (
              value.type !== "SvelteMustacheTag" ||
              value.expression.type !== "Identifier"
            ) {
              return
            }
            if (node.key.name === value.expression.name) {
              context.report({
                node,
                messageId: "expectedShorthand",
                *fix(fixer) {
                  yield fixer.remove(node.key)
                  yield fixer.remove(sourceCode.getTokenAfter(node.key)!)
                },
              })
            }
          },
        }
      : {
          SvelteShorthandAttribute(node) {
            context.report({
              node,
              messageId: "expectedRegular",
              fix(fixer) {
                return fixer.insertTextBefore(node, `${node.key.name}=`)
              },
            })
          },
        }
  },
})
