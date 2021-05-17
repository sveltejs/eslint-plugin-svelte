import assert from "assert"
import eslint from "eslint"
import plugin from "../../../src/index"

describe("ignore-warnings", () => {
  it("disable rules if ignoreWarnings: [ruleName]", async () => {
    const code = `
      {@html a+b}
      {@debug a}
      <script>
        a+b;
      </script>
      `

    const linter = new eslint.ESLint({
      plugins: {
        "@ota-meshi/svelte": plugin,
      },
      baseConfig: {
        parser: require.resolve("svelte-eslint-parser"),
        parserOptions: {
          ecmaVersion: 2020,
        },
        plugins: ["@ota-meshi/svelte"],
        rules: {
          "no-undef": "error",
          "space-infix-ops": "error",
          "@ota-meshi/svelte/no-at-html-tags": "error",
          "@ota-meshi/svelte/no-at-debug-tags": "error",
          "@ota-meshi/svelte/system": "error",
        },
        settings: {
          "@ota-meshi/svelte": {
            ignoreWarnings: [
              "no-undef",
              "space-infix-ops",
              "@ota-meshi/svelte/no-at-debug-tags",
            ],
          },
        },
      },
      useEslintrc: false,
    })
    const result = await linter.lintText(code, { filePath: "test.svelte" })
    const messages = result[0].messages

    assert.deepStrictEqual(
      messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
      [
        {
          ruleId: "@ota-meshi/svelte/no-at-html-tags",
          line: 2,
        },
        {
          ruleId: "no-undef",
          line: 5,
        },
        {
          ruleId: "space-infix-ops",
          line: 5,
        },
        {
          ruleId: "no-undef",
          line: 5,
        },
      ],
    )
  })
  it("disable rules if ignoreWarnings: [regexp]", async () => {
    const code = `
      {@html a+b}
      {@debug a}
      <script>
        a+b;
      </script>
      `

    const linter = new eslint.ESLint({
      plugins: {
        "@ota-meshi/svelte": plugin,
      },
      baseConfig: {
        parser: require.resolve("svelte-eslint-parser"),
        parserOptions: {
          ecmaVersion: 2020,
        },
        plugins: ["@ota-meshi/svelte"],
        rules: {
          "no-undef": "error",
          "space-infix-ops": "error",
          "@ota-meshi/svelte/no-at-html-tags": "error",
          "@ota-meshi/svelte/no-at-debug-tags": "error",
          "@ota-meshi/svelte/system": "error",
        },
        settings: {
          "@ota-meshi/svelte": {
            ignoreWarnings: ["no-undef", "/debug/", "/^space/"],
          },
        },
      },
      useEslintrc: false,
    })
    const result = await linter.lintText(code, { filePath: "test.svelte" })
    const messages = result[0].messages

    assert.deepStrictEqual(
      messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
      [
        {
          line: 2,
          ruleId: "@ota-meshi/svelte/no-at-html-tags",
        },
        {
          ruleId: "no-undef",
          line: 5,
        },
        {
          ruleId: "space-infix-ops",
          line: 5,
        },
        {
          ruleId: "no-undef",
          line: 5,
        },
      ],
    )
  })
})
