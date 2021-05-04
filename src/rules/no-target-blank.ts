import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"

/** Checks wether the given attr node is target="_blank"  */
function isTargetBlank(node: AST.SvelteAttribute) {
  return (
    node.key.name === "target" &&
    node.value.length === 1 &&
    node.value[0].type === "SvelteText" &&
    node.value[0].value === "_blank"
  )
}

/** Checks wether the given element node has secure rel="..." */
function hasSecureRel(
  node: AST.SvelteAttribute["parent"],
  allowReferrer: boolean,
) {
  return node.attributes.some((attr) => {
    if (attr.type === "SvelteAttribute" && attr.key.name === "rel") {
      const tags =
        attr.value.length === 1 &&
        attr.value[0].type === "SvelteText" &&
        attr.value[0].value.toLowerCase().split(" ")
      return (
        tags &&
        tags.includes("noopener") &&
        (allowReferrer || tags.includes("noreferrer"))
      )
    }
    return false
  })
}

/** Checks wether the given element node has external link */
function hasExternalLink(node: AST.SvelteAttribute["parent"]) {
  return node.attributes.some(
    (attr) =>
      attr.type === "SvelteAttribute" &&
      attr.key.name === "href" &&
      attr.value.length === 1 &&
      attr.value[0].type === "SvelteText" &&
      /^(?:\w+:|\/\/)/.test(attr.value[0].value),
  )
}

/** Checks wether the given element node has dynamic link */
function hasDynamicLink(node: AST.SvelteAttribute["parent"]) {
  return node.attributes.some(
    (attr) =>
      (attr.type === "SvelteAttribute" &&
        attr.key.name === "href" &&
        attr.value.some((v) => v.type === "SvelteMustacheTag")) ||
      (attr.type === "SvelteShorthandAttribute" && attr.key.name === "href"),
  )
}

export default createRule("no-target-blank", {
  meta: {
    docs: {
      description: `disallow target="_blank" attribute without rel="noopener noreferrer"`,
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          allowReferrer: {
            type: "boolean",
          },
          enforceDynamicLinks: {
            enum: ["always", "never"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      disallow:
        'Using target="_blank" without rel="noopener noreferrer" is a security risk.',
    },
    type: "problem",
  },
  create(context) {
    const configuration = context.options[0] || {}
    const allowReferrer = Boolean(configuration.allowReferrer) || false
    const enforceDynamicLinks: "always" | "never" =
      configuration.enforceDynamicLinks || "always"

    return {
      SvelteAttribute(node) {
        if (!isTargetBlank(node) || hasSecureRel(node.parent, allowReferrer)) {
          return
        }

        const hasDangerHref =
          hasExternalLink(node.parent) ||
          (enforceDynamicLinks === "always" && hasDynamicLink(node.parent))

        if (hasDangerHref) {
          context.report({
            node,
            message:
              'Using target="_blank" without rel="noopener noreferrer" is a security risk.',
          })
        }
      },
    }
  },
})
