<script>
  import ESLintEditor from "../eslint/ESLintEditor.svelte"
  import RulesSettings from "../eslint/RulesSettings.svelte"
  import { deserializeState, serializeState } from "../eslint/scripts/state"
  import {
    DEFAULT_RULES_CONFIG,
    getRule,
    createLinter,
    preprocess,
    postprocess,
  } from "../eslint/scripts/linter.js"
  import { loadModulesForBrowser } from "../../../../src/shared/svelte-compile-warns/transform/load-module"
  const linter = loadModulesForBrowser()
    .then(async () => {
      const parser = await import("@typescript-eslint/parser")
      if (typeof window !== "undefined") {
        window.require.define("@typescript-eslint/parser", parser)
      }
    })
    .then(() => {
      return createLinter()
    })

  const DEFAULT_CODE =
    `<!-- Welcome to eslint-plugin-svelte -->
<script>
  let a = 1;
  let b = 2;
  // let c = 2;
  let string = \`this string contains some <strong>HTML!!!</strong>\`;
  let user = {
    firstname: 'Ada',
    lastname: 'Lovelace'
  };
    let current = 'foo';
  let color = 'red';
  let active = true;
<` +
    `/script>

<input
  type="number"
  bind:value={a}>
<input
    type="number"
  bind:value={b}>
<input
  type="number"
  bind:value={c}>
<p>{a} + {b} + {c} = {a + b + c}</p>

<p>{@html string}</p>

<input bind:value={user.firstname}>
<input bind:value={user.lastname}>

{@debug user}

<h1>Hello {user.firstname}!</h1>

{#if a}
  <div>foo</div>
{:else if b}
  <div>bar</div>
{:else if b}
  <div>baz</div>
{/if}

<button
  type=button
  class="{active ? 'active' : ''} {current === 'foo' ? 'selected' : ''}"
  on:click="{() => current = 'foo'}"
>foo</button>

<div style="color: {color};">...</div>
`

  const state = deserializeState(
    (typeof window !== "undefined" && window.location.hash.slice(1)) || "",
  )
  let code = state.code || DEFAULT_CODE
  let rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG)
  let messages = []
  let time = ""
  let options = {
    filename: "example.svelte",
    preprocess,
    postprocess,
  }
  let editor

  $: serializedString = (() => {
    const serializeCode = DEFAULT_CODE === code ? undefined : code
    const serializeRules = equalsRules(DEFAULT_RULES_CONFIG, rules)
      ? undefined
      : rules
    return serializeState({
      code: serializeCode,
      rules: serializeRules,
    })
  })()
  $: {
    if (typeof window !== "undefined") {
      window.location.replace(`#${serializedString}`)
    }
  }
  function onLintedResult(evt) {
    messages = evt.detail.messages
    time = `${evt.detail.time}ms`
  }
  function onUrlHashChange() {
    const newSerializedString =
      (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
    if (newSerializedString !== serializedString) {
      const state = deserializeState(newSerializedString)
      code = state.code || DEFAULT_CODE
      rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG)
    }
  }

  /** */
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

  function onClickMessage(evt, msg) {
    evt.stopPropagation()
    evt.preventDefault()
    if (editor) {
      editor.setCursorPosition({
        start: {
          line: msg.line,
          column: msg.column,
        },
        end: {
          line: msg.endLine ?? msg.line,
          column: msg.endColumn ?? msg.column,
        },
      })
    }
  }
</script>

<svelte:window on:hashchange={onUrlHashChange} />

<div class="playground-root">
  <div class="playground-tools">
    <span style:margin-left="16px">{time}</span>
  </div>
  <div class="playground-content">
    <RulesSettings bind:rules />
    <div class="editor-content">
      <ESLintEditor
        bind:this={editor}
        {linter}
        bind:code
        config={{
          parser: "svelte-eslint-parser",
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: {
              ts: "@typescript-eslint/parser",
              typescript: "@typescript-eslint/parser",
            },
          },
          rules,
          env: {
            browser: true,
            es2021: true,
          },
        }}
        {options}
        on:result={onLintedResult}
      />
      <div class="messages">
        <ol>
          {#each messages as msg, i (`${msg.line}:${msg.column}:${msg.ruleId}@${i}`)}
            <li class="message">
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a
                href="#"
                on:click={(evt) => onClickMessage(evt, msg)}
                class="message-link">[{msg.line}:{msg.column}]</a
              >:
              {msg.message}
              <a
                class="rule-link {getRule(msg.ruleId)?.classes}"
                class:is-rule-error={msg.ruleId}
                href={getRule(msg.ruleId)?.url}
                target="_blank"
                rel="noopener noreferrer">({msg.ruleId})</a
              >
            </li>
          {/each}
        </ol>
      </div>
    </div>
  </div>
</div>

<style>
  .playground-root {
    height: calc(100vh - 180px);
  }
  .playground-tools {
    height: 24px;
    text-align: end;
  }
  .playground-content {
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 16px);
    border: 1px solid #cfd4db;
    background-color: #282c34;
    color: #fff;
  }

  .playground-content > .editor-content {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #cfd4db;
    min-width: 1px;
  }

  .playground-content > .editor-content > .messages {
    height: 30%;
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
    border-top: 1px solid #cfd4db;
    padding: 8px;
    font-size: 12px;
  }
  .playground-content
    > .editor-content
    > .messages
    .rule-link:not(.is-rule-error) {
    display: none;
  }
  .rule-link {
    transition: color 0.2s linear;
  }
  .rule-link.svelte-rule {
    color: #40b3ff80;
  }
  .rule-link.svelte-rule:hover {
    color: #40b3ff;
  }
  .rule-link.core-rule {
    color: #8080f280;
  }
  .rule-link.core-rule:hover {
    color: #8080f2;
  }
  .message-link {
    color: #40b3ff;
  }
</style>
