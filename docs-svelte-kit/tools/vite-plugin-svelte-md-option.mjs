import highlight from "./highlight.mjs"
import replaceLinkPlugin from "./markdown-it-replace-link.mjs"
import emojiPlugin from "markdown-it-emoji"
import anchorPlugin from "markdown-it-anchor"
import containerPlugin from "markdown-it-container"
import autoInjectComponentsPlugin from "./markdown-it-auto-inject-components.mjs"
import titlePlugin from "./markdown-it-title.mjs"
import markdownPlugin from "./markdown-it-markdown.mjs"
import containerPluginOption from "./markdown-it-container-option.mjs"
import slugify from "@sindresorhus/slugify"

export default (options = {}) => ({
  wrapperClasses: [],
  markdownItOptions: {
    highlight,
  },
  markdownItUses: [
    [
      replaceLinkPlugin,
      {
        baseUrl: options.baseUrl,
        root: options.root,
      },
    ],
    emojiPlugin,
    [
      anchorPlugin,
      {
        slugify,
        permalink: anchorPlugin.permalink.linkInsideHeader({
          symbol: "#",
          placement: "before",
        }),
      },
    ],
    autoInjectComponentsPlugin,
    titlePlugin,
    markdownPlugin,
    [containerPlugin, "tip", containerPluginOption("tip")],
    [containerPlugin, "warning", containerPluginOption("warning")],
    [containerPlugin, "danger", containerPluginOption("danger", "warning")],
    [containerPlugin, "details", containerPluginOption("details")],
  ],
})
