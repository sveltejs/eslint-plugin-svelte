import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"

const labeledStatementBase = `SvelteReactiveStatement > ExpressionStatement > AssignmentExpression`

export default createRule("no-reactive-literals", {
  meta: {
    docs: {
      description: "Don't assign literal values in reactive statements",
      category: "Stylistic Issues",
      recommended: false,
      conflictWithPrettier: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      noReactiveLiterals: `Do not assign literal values inside reactive statements unless absolutely necessary.`,
    },
    type: "suggestion",
  },
  create(context) {
    /**
     * Reusable method for multiple types of nodes that should warn
     *
     * @param node TSESTree.AssignmentExpression the node that was found
     * @returns void
     */
    function warn(node: TSESTree.AssignmentExpression) {
      // Move upwards to include the entire reactive statement
      const parent = node.parent?.parent

      if (!parent) {
        return false
      }

      const source = context.getSourceCode()

      return context.report({
        node: parent,
        loc: parent.loc,
        messageId: "noReactiveLiterals",

        fix(fixer) {
          return [
            // Insert "let" + whatever was in there
            fixer.insertTextBefore(parent, `let ${source.getText(node)}`),

            // Remove the original reactive statement
            fixer.remove(parent),
          ]
        },
      })
    }

    return {
      // $: foo = "foo";
      // $: foo = 1;
      [`${labeledStatementBase}[right.type="Literal"]`]: warn,

      // $: foo = [];
      [`${labeledStatementBase}[right.type="ArrayExpression"][right.elements.length=0]`]:
        warn,

      // $: foo = {};
      [`${labeledStatementBase}[right.type="ObjectExpression"][right.properties.length=0]`]:
        warn,
    }
  },
})
