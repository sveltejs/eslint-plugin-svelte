import path from "path"
import spawn from "cross-spawn"

class TOCRenderer {
  constructor(name) {
    const item = { children: [] }
    this.tree = item
    this.stack = { item, level: 1, upper: null }
    this.name = name
  }

  addMenu(level, id, title) {
    if (this.stack.level < level) {
      const parent = this.stack.item
      const item = parent.children[parent.children.length - 1]
      if (item) {
        this.stack = { item, level, upper: this.stack }
      }
    }
    while (level < this.stack.level && this.stack.upper) {
      this.stack = this.stack.upper
    }
    const item = { level, id, title, children: [] }
    this.stack.item.children.push(item)
  }

  toc() {
    return this.tree
  }
}
/**
 * @param {import('markdown-it')} md
 */
export default (md) => {
  md.core.ruler.push("custom_markdown", (state) => {
    const tokens = state.tokens
    tokens.unshift(new state.Token("custom_markdown_open"))
    tokens.push(new state.Token("custom_markdown_close"))
  })
  // eslint-disable-next-line camelcase -- ignore
  md.renderer.rules.custom_markdown_close = () => `</Markdown>`
  // eslint-disable-next-line camelcase -- ignore
  md.renderer.rules.custom_markdown_open = (
    tokens,
    _idx,
    _options,
    env,
    _self,
  ) => {
    const name = path.basename(env.id).replace(/\.md$/, "")
    const renderer = new TOCRenderer(name)
    for (let idx = 0; idx < tokens.length; idx++) {
      const token = tokens[idx]

      if (token.type !== "heading_open") {
        continue
      }
      let level = Number(token.tag.substr(1))
      if (level > 3) {
        continue
      }
      // Aggregate the next token children text.
      const title = tokens[idx + 1].children
        .filter(
          (token) =>
            token.type === "text" ||
            token.type === "emoji" ||
            token.type === "code_inline",
        )
        .reduce((acc, t) => acc + t.content, "")

      let slug = token.attrGet("id")
      renderer.addMenu(level, slug, title)
    }

    const fileInfo = {}
    const timestamp = getGitLastUpdatedTimestamp(env.id)
    if (timestamp) {
      fileInfo.timestamp = timestamp
      fileInfo.lastUpdated = new Date(timestamp).toLocaleString()
    }
    return `<script>
  import Markdown from "$lib/markdown/Markdown.svelte"
  const toc = ${JSON.stringify(renderer.toc())}
  const fileInfo = ${JSON.stringify(fileInfo)}
</script>

<Markdown {toc} {frontmatter} {fileInfo} >
  `
  }
}

/** Get last updated timestamp */
function getGitLastUpdatedTimestamp(filePath) {
  let lastUpdated
  try {
    lastUpdated =
      parseInt(
        spawn
          .sync("git", ["log", "-1", "--format=%at", path.basename(filePath)], {
            cwd: path.dirname(filePath),
          })
          .stdout.toString("utf-8"),
        10,
      ) * 1000
  } catch {
    /* do not handle for now */
  }
  return lastUpdated
}
