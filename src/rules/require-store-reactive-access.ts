import type * as ESTree from "estree"
import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { createStoreChecker } from "./reference-helpers/svelte-store"

export default createRule("require-store-reactive-access", {
  meta: {
    docs: {
      description:
        "disallow to render store itself. Need to use $ prefix or get function.",
      category: "Possible Errors",
      // TODO Switch to recommended in the major version.
      // recommended: true,
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      usingRawStoreInText:
        "Use $ prefix or get function, instead of using raw stores in template.",
    },
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isSvelte) {
      return {}
    }
    const isStore = createStoreChecker(context)

    /** Verify for expression node */
    function verifyExpression(
      node: ESTree.Expression | null,
      options?: { disableFix?: boolean },
    ) {
      if (!node) return
      if (isStore(node)) {
        context.report({
          node,
          messageId: "usingRawStoreInText",
          fix:
            node.type === "Identifier" && !options?.disableFix
              ? (fixer) => fixer.insertTextBefore(node, "$")
              : null,
        })
      }
    }

    return {
      SvelteMustacheTag(node) {
        if (canAcceptStoreMustache(node)) {
          return
        }
        // Check for <p>{store}<p/>, etc.
        verifyExpression(node.expression)
      },
      SvelteShorthandAttribute(node) {
        if (canAcceptStoreAttributeElement(node.parent.parent)) {
          return
        }
        // Check for <div {store} />
        verifyExpression(node.value, { disableFix: true })
      },
      SvelteSpreadAttribute(node) {
        // Check for <Foo {...store} />
        verifyExpression(node.argument)
      },
      SvelteDirective(node) {
        if (
          node.kind === "Action" ||
          node.kind === "Animation" ||
          node.kind === "Transition"
        ) {
          if (node.key.name.type !== "Identifier") {
            return
          }
          // Check for <button use:store />, <div animate:store />, or <div transition:store />
          verifyExpression(node.key.name)
        } else if (node.kind === "Binding") {
          if (
            node.key.name.name !== "this" &&
            canAcceptStoreAttributeElement(node.parent.parent)
          ) {
            return
          }
          // Check for <button bind:value={store} />
          verifyExpression(node.expression, {
            disableFix: node.shorthand,
          })
        } else if (node.kind === "EventHandler") {
          // Check for <button on:click={store} />
          verifyExpression(node.expression)
        }
        // What about class:nm={store}?
        // It determines truthy values. We don't check for it
        // because it's a false positive if store is nullable.
      },
      SvelteStyleDirective(node) {
        if (node.shorthand && node.key.name.type === "Identifier") {
          // Check for <div style:color />
          verifyExpression(node.key.name, {
            disableFix: true,
          })
        }
        // The longform has already been checked in SvelteMustacheTag
      },
      SvelteSpecialDirective(node) {
        if (node.kind === "this") {
          // Check for <button this={store} />
          verifyExpression(node.expression)
        }
      },
    }

    /**
     * Checks whether the given mustache node accepts a store instance.
     */
    function canAcceptStoreMustache(node: AST.SvelteMustacheTag) {
      if (node.parent.type !== "SvelteAttribute") {
        // Text interpolation
        // e.g.
        // <p>{store}</p>
        // <input style:color={store} />
        return false
      }
      const attr = node.parent
      if (attr.value.length > 1) {
        // Template attribute value
        // e.g.
        // <Foo message="Hello {store}" />
        return false
      }
      if (attr.key.name.startsWith("--")) {
        // --style-props
        // e.g.
        // <Foo --style-props={store} />
        return false
      }
      const element = attr.parent.parent
      return canAcceptStoreAttributeElement(element)
    }

    /**
     * Checks whether the given element node accepts a store instance attribute.
     */
    function canAcceptStoreAttributeElement(
      node:
        | AST.SvelteElement
        | AST.SvelteScriptElement
        | AST.SvelteStyleElement,
    ) {
      if (node.type !== "SvelteElement") {
        // Unknown. Within <script> or <style>
        return false
      }
      if (
        node.kind === "html" ||
        (node.kind === "special" && node.name.name === "svelte:element")
      ) {
        // Native HTML attribute value
        // e.g.
        // <div data-message={store} />
        return false
      }
      // Component props
      // e.g.
      // <Foo data={store} />
      // <Foo {store} />
      return true
    }
  },
})
