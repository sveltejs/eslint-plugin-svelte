<script>
  import { onMount } from "svelte"
  import ESLintEditor from "../eslint/ESLintEditor.svelte"
  import {
    createLinter,
    preprocess,
    postprocess,
  } from "../eslint/scripts/linter.js"
  import { loadTsParser } from "../eslint/scripts/ts-parser.js"
  import { loadModulesForBrowser } from "../../../../src/utils/load-module"

  const modulesForBrowser = loadModulesForBrowser()
  const loadLinter = createLinter()

  let tsParser = null

  let code = ""
  export let config = {}
  export let rules = {}
  export let fix = false
  export let language = "svelte"
  let time = ""
  $: options = {
    filename: language === "svelte" ? "example.svelte" : "example.js",
    preprocess,
    postprocess,
  }
  $: hasLangTs =
    /lang\s*=\s*(?:"ts"|ts|'ts'|"typescript"|typescript|'typescript')/u.test(
      code,
    )
  $: linter = modulesForBrowser.then(
    hasLangTs && !tsParser
      ? async () => {
          tsParser = await loadTsParser()
          return loadLinter
        }
      : () => loadLinter,
  )
  let showDiff = fix

  function onLintedResult(evt) {
    time = `${evt.detail.time}ms`
  }

  let slotRoot
  onMount(() => {
    code = slotRoot.textContent.trim()
  })
  $: blockHeight = `${Math.max(
    120,
    20 * (1 + code.split("\n").length) + 100,
  )}px`
</script>

<div class="eslint-code-block-default-content" bind:this={slotRoot}>
  <slot />
</div>

<div class="eslint-code-block-root" style:height={blockHeight}>
  <ESLintEditor
    {linter}
    bind:code
    config={{
      parser: language === "svelte" ? "svelte-eslint-parser" : undefined,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: {
          ts: tsParser,
          typescript: tsParser,
        },
      },
      rules,
      env: {
        browser: true,
        es2021: true,
      },
      ...config,
    }}
    {language}
    {options}
    on:result={onLintedResult}
    showDiff={showDiff && fix}
  />
  <div class="eslint-code-block-tools">
    {#if fix}
      <label>
        <input bind:checked={showDiff} type="checkbox" />
        Show Diff
      </label>
    {/if}
    <span style:margin-left="16px">{time}</span>
  </div>
</div>

<style>
  .eslint-code-block-default-content {
    display: none;
  }
  .eslint-code-block-root {
    height: 300px;
  }
  .eslint-code-block-tools {
    text-align: end;
  }
</style>
