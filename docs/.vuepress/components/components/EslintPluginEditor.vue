<template>
  <eslint-editor
    ref="editor"
    :linter="linter"
    :config="config"
    :code="code"
    class="eslint-code-block"
    :language="language"
    :filename="fileName"
    :preprocess="preprocess"
    :postprocess="postprocess"
    :dark="dark"
    :format="format"
    :fix="fix"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import EslintEditor from "vue-eslint-editor"
import plugin from "../../../.."

export default {
  name: "EslintPluginEditor",
  components: { EslintEditor },
  model: {
    prop: "code",
  },
  props: {
    code: {
      type: String,
      default: "",
    },
    fix: {
      type: Boolean,
    },
    rules: {
      type: Object,
      default() {
        return {}
      },
    },
    dark: {
      type: Boolean,
    },
    language: {
      type: String,
      default: "html",
    },
    fileName: {
      type: String,
      default: "a.svelte",
    },
    parser: {
      type: String,
      default: "svelte-eslint-parser",
    },
  },

  data() {
    return {
      eslint4b: null,
      svelteESLintParser: null,
      format: {
        insertSpaces: true,
        tabSize: 2,
      },
      preprocess: plugin.processors[".svelte"].preprocess,
      postprocess: plugin.processors[".svelte"].postprocess,
    }
  },

  computed: {
    config() {
      return {
        globals: {
          // ES2015 globals
          ArrayBuffer: false,
          DataView: false,
          Float32Array: false,
          Float64Array: false,
          Int16Array: false,
          Int32Array: false,
          Int8Array: false,
          Map: false,
          Promise: false,
          Proxy: false,
          Reflect: false,
          Set: false,
          Symbol: false,
          Uint16Array: false,
          Uint32Array: false,
          Uint8Array: false,
          Uint8ClampedArray: false,
          WeakMap: false,
          WeakSet: false,
          // ES2017 globals
          Atomics: false,
          SharedArrayBuffer: false,
        },
        rules: this.rules,
        parser: this.parser,
        parserOptions: {
          sourceType: "script",
          ecmaVersion: 2020,
        },
      }
    },
    linter() {
      if (!this.eslint4b || !this.svelteESLintParser) {
        return null
      }
      const Linter = this.eslint4b

      const linter = new Linter()
      linter.defineParser("svelte-eslint-parser", this.svelteESLintParser)

      for (const k of Object.keys(plugin.rules)) {
        const rule = plugin.rules[k]
        linter.defineRule(rule.meta.docs.ruleId, rule)
      }

      return linter
    },
  },

  async mounted() {
    // Load linter asynchronously.
    const [{ default: eslint4b }, svelteESLintParser] = await Promise.all([
      import("eslint4b"),
      import("espree").then(() => import("svelte-eslint-parser")),
    ])
    this.eslint4b = eslint4b
    this.svelteESLintParser = svelteESLintParser
  },
}
</script>

<style scoped>
.eslint-code-block {
  width: 100%;
  margin: 1em 0;
}
</style>
