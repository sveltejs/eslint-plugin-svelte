import prism from "prismjs"
import loadLanguages from "prismjs/components/index.js"
import escapeHtml from "escape-html"
import "prism-svelte"

// required to make embedded highlighting work...
loadLanguages(["markup", "css", "javascript"])

/** Wrap pre tag */
function wrapPre(code, lang) {
  const htmlCode = lang === "text" ? escapeHtml(code) : code
  // https://github.com/sveltejs/svelte/issues/6437
  const avoidPreTrimmed = htmlCode.replace(
    /(<\w+(?:\s[^/>]*)?>)(\s)/giu,
    (_match, tag, space) => {
      return `${tag}<span />${space}`
    },
  )
  return `<pre class="language-${lang}"><code>${avoidPreTrimmed}</code></pre>`
}

const EXTENSION_MAPPINGS = {
  vue: "markup",
  html: "markup",
  svelte: "svelte",
  sv: "svelte",
  md: "markdown",
  rb: "ruby",
  ts: "typescript",
  py: "python",
  sh: "bash",
  yml: "yaml",
  styl: "stylus",
  kt: "kotlin",
  rs: "rust",
}

export default (str, lang) => {
  if (!lang) {
    return wrapPre(str, "text")
  }
  let normalLang = lang.toLowerCase()
  const rawLang = lang

  normalLang = EXTENSION_MAPPINGS[normalLang] || normalLang

  if (!prism.languages[normalLang]) {
    try {
      loadLanguages([normalLang])
    } catch {
      // ignore
    }
  }
  if (prism.languages[normalLang]) {
    const code = prism.highlight(str, prism.languages[normalLang], normalLang)
    return wrapPre(code, rawLang)
  }
  return wrapPre(str, "text")
}
