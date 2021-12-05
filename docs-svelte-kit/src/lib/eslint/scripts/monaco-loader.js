async function setupMonaco() {
  if (typeof window !== "undefined") {
    const monacoScript =
      Array.from(document.head.querySelectorAll("script")).find(
        (script) =>
          script.src &&
          script.src.includes("monaco") &&
          script.src.includes("vs/loader"),
      ) || (await appendMonacoEditorScript())
    window.require.config({
      paths: {
        vs: monacoScript.src.replace(/\/vs\/.*$/u, "/vs"),
      },
      "vs/nls": {
        availableLanguages: {
          "*": "ja",
        },
      },
    })
  }
}

function appendMonacoEditorScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/loader.min.js"
    script.onload = () => {
      script.onload = null

      watch()

      function watch() {
        if (window.require) {
          resolve(script)
          return
        }
        setTimeout(watch, 200)
      }
    }
    document.head.append(script)
  })
}

let setupedMonaco = null
let editorLoaded = null

export async function loadMonacoEditor() {
  await (setupedMonaco || (setupedMonaco = setupMonaco()))
  return (
    editorLoaded ||
    (editorLoaded = new Promise((resolve) => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line node/no-missing-require -- ignore
        window.require(["vs/editor/editor.main"], (r) => {
          resolve(r)
        })
      }
    }))
  )
}
