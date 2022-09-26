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

export function loadMonacoEngine() {
  return setupedMonaco || (setupedMonaco = setupMonaco())
}
export function loadMonacoEditor() {
  return (
    editorLoaded ||
    (editorLoaded = loadModuleFromMonaco("vs/editor/editor.main"))
  )
}

export async function loadModuleFromMonaco(moduleName) {
  await loadMonacoEngine()
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      window.require([moduleName], (r) => {
        resolve(r)
      })
    }
  })
}
