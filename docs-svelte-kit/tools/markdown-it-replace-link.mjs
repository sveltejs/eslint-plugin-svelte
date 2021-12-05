// eslint-disable-next-line eslint-comments/disable-enable-pair -- ignore
/* eslint-disable camelcase -- ignore */
// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. converting internal links to remove .md
import path from "path"

export default (md) => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex("href")
    if (hrefIndex >= 0) {
      const link = token.attrs[hrefIndex]
      const href = link[1]
      if (/^https?:/.test(href)) {
        const proxyToken = {
          ...token,
          attrs: [...token.attrs, ["target", "_blank"]],
        }
        return self.renderToken([proxyToken], 0, options)
      } else if (/\.md(?:#.*)?$/.test(href)) {
        const proxyToken = {
          ...token,
          attrs: [
            ...token.attrs.slice(0, hrefIndex - 1),
            [link[0], href.replace(/\.md$/, "").replace(/\.md(#.*)$/, `$1`)],
            ...token.attrs.slice(hrefIndex + 1),
          ],
        }
        return self.renderToken([proxyToken], 0, options)
      } else if (/^#.*$/.test(href)) {
        // Avoid build error
        const name = path.basename(env.id).replace(/\.md$/, "")
        const proxyToken = {
          ...token,
          attrs: [
            ...token.attrs.slice(0, hrefIndex - 1),
            [link[0], name + href],
            ...token.attrs.slice(hrefIndex + 1),
          ],
        }
        return self.renderToken([proxyToken], 0, options)
      }
    }
    return self.renderToken(tokens, idx, options)
  }
}
