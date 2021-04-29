<template>
  <div class="app">
    <sns-bar />
    <div class="main-content">
      <rules-settings
        ref="settings"
        class="rules-settings"
        :rules.sync="rules"
      />
      <div class="editor-content">
        <pg-editor
          v-model="code"
          :rules="rules"
          class="eslint-playground"
          @change="onChange"
        />
        <div class="messages">
          <ol>
            <li
              v-for="(msg, i) in messages"
              :key="msg.line + ':' + msg.column + ':' + msg.ruleId + '@' + i"
              class="message"
            >
              [{{ msg.line }}:{{ msg.column }}]: {{ msg.message }} (<a
                :href="getURL(msg.ruleId)"
                target="_blank"
              >
                {{ msg.ruleId }} </a
              >)
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as coreRules from "eslint4b/dist/core-rules"
import plugin from "../../.."
import PgEditor from "./components/PgEditor.vue"
import RulesSettings from "./components/RulesSettings.vue"
import SnsBar from "./components/SnsBar.vue"
import { deserializeState, serializeState } from "./state"
import { DEFAULT_RULES_CONFIG } from "./rules"

const DEFAULT_CODE =
  `<!--welcome to @ota-meshi/eslint-plugin-svelte-->
<script>
    let a = 1;
    let b = 2;
    // let c = 2;
<` +
  `/script>

<input type="number" bind:value={a}>
<input type="number" bind:value={b}>
<input type="number" bind:value={c}>

<p>{a} + {b} = {a + b + c}</p>`

const ruleURLs = {}
for (const k of Object.keys(plugin.rules)) {
  const rule = plugin.rules[k]
  // @ts-ignore
  ruleURLs[rule.meta.docs.ruleId] = rule.meta.docs.url
}
for (const k of Object.keys(coreRules)) {
  const rule = coreRules[k]
  // @ts-ignore
  ruleURLs[k] = rule.meta.docs.url
}

export default {
  name: "PlaygroundBlock",
  components: { PgEditor, RulesSettings, SnsBar },
  data() {
    const serializedString =
      // @ts-ignore
      (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
    const state = deserializeState(serializedString)
    return {
      // @ts-ignore
      code: state.code || DEFAULT_CODE,
      // @ts-ignore
      rules: state.rules || Object.assign({}, DEFAULT_RULES_CONFIG),
      messages: [],
    }
  },
  computed: {
    serializedString() {
      const defaultCode = DEFAULT_CODE
      const defaultRules = DEFAULT_RULES_CONFIG
      // @ts-ignore
      const code = defaultCode === this.code ? undefined : this.code
      // @ts-ignore
      const rules = equalsRules(defaultRules, this.rules)
        ? undefined
        : // @ts-ignore
          this.rules
      const serializedString = serializeState({
        code,
        rules,
      })
      return serializedString
    },
  },
  watch: {
    // @ts-ignore
    serializedString(serializedString) {
      // @ts-ignore
      if (typeof window !== "undefined") {
        // @ts-ignore
        window.location.replace(`#${serializedString}`)
      }
    },
  },
  mounted() {
    // @ts-ignore
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.addEventListener("hashchange", this.onUrlHashChange)
    }
  },
  beforeDestroey() {
    // @ts-ignore
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.removeEventListener("hashchange", this.onUrlHashChange)
    }
  },
  methods: {
    // @ts-ignore
    onChange({ messages }) {
      // @ts-ignore
      this.messages = messages
    },
    // @ts-ignore
    getURL(ruleId) {
      // @ts-ignore
      return ruleURLs[ruleId] || ""
    },
    onUrlHashChange() {
      const serializedString =
        // @ts-ignore
        (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
      // @ts-ignore
      if (serializedString !== this.serializedString) {
        const state = deserializeState(serializedString)
        // @ts-ignore
        this.code = state.code || DEFAULT_CODE
        // @ts-ignore
        this.rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG)
        // @ts-ignore
        this.script = state.script
      }
    },
  },
}

// @ts-ignore
function equalsRules(a, b) {
  const akeys = Object.keys(a).filter((k) => a[k] !== "off")
  const bkeys = Object.keys(b).filter((k) => b[k] !== "off")
  if (akeys.length !== bkeys.length) {
    return false
  }

  for (const k of akeys) {
    if (a[k] !== b[k]) {
      return false
    }
  }
  return true
}
</script>
<style scoped>
.main-content {
  display: flex;
  flex-wrap: wrap;
  height: calc(100% - 100px);
  border: 1px solid #cfd4db;
  background-color: #282c34;
  color: #f8c555;
}

.main-content > .rules-settings {
  height: 100%;
  overflow: auto;
  width: 25%;
  box-sizing: border-box;
}

.main-content > .editor-content {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #cfd4db;
}

.main-content > .editor-content > .eslint-playground {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 3px;
}

.main-content > .editor-content > .messages {
  height: 30%;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  border-top: 1px solid #cfd4db;
  padding: 8px;
  font-size: 12px;
}
</style>
