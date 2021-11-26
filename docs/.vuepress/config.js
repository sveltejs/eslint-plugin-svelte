/* eslint node/no-missing-require: 0 */
const path = require("path")

const { rules } = require("../../lib/utils/rules")

const svelteRules = rules.filter((rule) => !rule.meta.deprecated)

const categories = [
  "Possible Errors",
  "Security Vulnerability",
  "Best Practices",
  "Stylistic Issues",
  "Extension Rules",
  "System",
]
svelteRules.forEach((rule) => {
  if (!categories.includes(rule.meta.docs.category)) {
    throw new Error(`missing categories:${rule.meta.docs.category}`)
  }
})
const categoryRules = categories.map((cat) => {
  return {
    title: cat,
    rules: svelteRules.filter((rule) => rule.meta.docs.category === cat),
  }
})

function ruleToLink({
  meta: {
    docs: { ruleId, ruleName },
  },
}) {
  return [`/rules/${ruleName}`, ruleId]
}

module.exports = {
  base: "/eslint-plugin-svelte/",
  title: "@ota-meshi/eslint-plugin-svelte",
  description: "ESLint plugin for Svelte using AST",
  serviceWorker: true,
  evergreen: true,
  configureWebpack(_config, _isServer) {
    return {
      resolve: {
        alias: {
          module: require.resolve("./shim/module"),
          eslint$: path.resolve(__dirname, "./shim/eslint"),
          esquery: path.resolve(
            __dirname,
            "../../node_modules/esquery/dist/esquery.min.js",
          ),
          "@eslint/eslintrc/universal": path.resolve(
            __dirname,
            "../../node_modules/@eslint/eslintrc/dist/eslintrc-universal.cjs",
          ),
        },
      },
    }
  },

  head: [["link", { rel: "icon", type: "image/png", href: "/logo.png" }]],
  themeConfig: {
    logo: "/logo.svg",
    repo: "ota-meshi/eslint-plugin-svelte",
    docsRepo: "ota-meshi/eslint-plugin-svelte",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: true,
    lastUpdated: true,
    serviceWorker: {
      updatePopup: true,
    },

    nav: [
      { text: "Introduction", link: "/" },
      { text: "User Guide", link: "/user-guide/" },
      { text: "Rules", link: "/rules/" },
      { text: "Playground", link: "/playground/" },
    ],

    sidebar: {
      "/rules/": [
        "/rules/",
        ...categoryRules.map((cat) => {
          return {
            title: cat.title,
            collapsable: false,
            children: cat.rules.map(ruleToLink),
          }
        }),
        // Rules in no category.
        ...(rules.some((rule) => rule.meta.deprecated)
          ? [
              {
                title: "Deprecated",
                collapsable: false,
                children: rules
                  .filter((rule) => rule.meta.deprecated)
                  .map(ruleToLink),
              },
            ]
          : []),
      ],
      "/": ["/", "/user-guide/", "/rules/", "/playground/"],
    },
  },
}
