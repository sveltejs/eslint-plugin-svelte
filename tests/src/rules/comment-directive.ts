import assert from "assert"
import eslint from "eslint"
import plugin from "../../../src/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

// Initialize linter.
const linter = new eslint.ESLint({
  plugins: {
    "@ota-meshi/svelte": plugin as never,
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
      "@ota-meshi/svelte/comment-directive": "error",
    },
  },
  useEslintrc: false,
})

describe("comment-directive", () => {
  describe("eslint-disable/eslint-enable", () => {
    it("disable all rules if <!-- eslint-disable -->", async () => {
      const code = `
      <!-- eslint-disable -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("disable specific rules if <!-- eslint-disable space-infix-ops -->", async () => {
      const code = `
      <!-- eslint-disable space-infix-ops -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 3)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "no-undef")
    })

    it("enable all rules if <!-- eslint-enable -->", async () => {
      const code = `
      <!-- eslint-disable -->
      {@html a+b}
      <!-- eslint-enable -->
      {@html a+b}
       `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 4)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[0].line, 5)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 5)
      assert.strictEqual(messages[2].ruleId, "space-infix-ops")
      assert.strictEqual(messages[2].line, 5)
      assert.strictEqual(messages[3].ruleId, "no-undef")
      assert.strictEqual(messages[3].line, 5)
    })

    it("enable specific rules if <!-- eslint-enable space-infix-ops -->", async () => {
      const code = `
      <!-- eslint-disable @ota-meshi/svelte/no-at-html-tags, space-infix-ops -->
      {@html a+b}
      <!-- eslint-enable space-infix-ops -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 5)
      assert.strictEqual(messages[0].ruleId, "no-undef")
      assert.strictEqual(messages[0].line, 3)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 3)
      assert.strictEqual(messages[2].ruleId, "no-undef")
      assert.strictEqual(messages[2].line, 5)
      assert.strictEqual(messages[3].ruleId, "space-infix-ops")
      assert.strictEqual(messages[3].line, 5)
      assert.strictEqual(messages[4].ruleId, "no-undef")
      assert.strictEqual(messages[4].line, 5)
    })

    it("should not affect to the code in <script>.", async () => {
      const code = `
      <!-- eslint-disable -->
      {@html a+b}
      <script>
        a;
      </script>
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 1)
      assert.strictEqual(messages[0].ruleId, "no-undef")
    })

    it("disable specific rules if <!-- eslint-disable space-infix-ops ,, , @ota-meshi/svelte/no-at-html-tags -->", async () => {
      const code = `
      <!-- eslint-disable space-infix-ops ,, , @ota-meshi/svelte/no-at-html-tags -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 2)
      assert.strictEqual(messages[0].ruleId, "no-undef")
      assert.strictEqual(messages[1].ruleId, "no-undef")
    })
  })

  describe("eslint-disable-line", () => {
    it("disable all rules if <!-- eslint-disable-line -->", async () => {
      const code = `
      {@html a+b} <!-- eslint-disable-line -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("disable specific rules if <!-- eslint-disable-line space-infix-ops -->", async () => {
      const code = `
      {@html a+b} <!-- eslint-disable-line space-infix-ops -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 3)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "no-undef")
    })

    it("don't disable rules if <!-- eslint-disable-line --> is on another line", async () => {
      const code = `
      <!-- eslint-disable-line -->
      {@html a+b}
      <!-- eslint-disable-line -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 4)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "space-infix-ops")
      assert.strictEqual(messages[3].ruleId, "no-undef")
    })
  })

  describe("eslint-disable-next-line", () => {
    it("disable all rules if <!-- eslint-disable-next-line -->", async () => {
      const code = `
      <!-- eslint-disable-next-line -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("disable specific rules if <!-- eslint-disable-next-line space-infix-ops -->", async () => {
      const code = `
      <!-- eslint-disable-next-line space-infix-ops -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 3)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "no-undef")
    })

    it("don't disable rules if <!-- eslint-disable-next-line --> is on another line", async () => {
      const code = `
      <!-- eslint-disable-next-line -->

      {@html a+b} <!-- eslint-disable-next-line -->
      <!-- eslint-disable-next-line -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 4)

      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[0].line, 4)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 4)
      assert.strictEqual(messages[2].ruleId, "space-infix-ops")
      assert.strictEqual(messages[2].line, 4)
      assert.strictEqual(messages[3].ruleId, "no-undef")
      assert.strictEqual(messages[3].line, 4)
    })

    it("should affect only the next line", async () => {
      const code = `
      <!-- eslint-disable-next-line @ota-meshi/svelte/no-at-html-tags, space-infix-ops -->
      {@html a+b}
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 6)
      assert.strictEqual(messages[0].ruleId, "no-undef")
      assert.strictEqual(messages[0].line, 3)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 3)

      assert.strictEqual(
        messages[2].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[2].line, 4)
      assert.strictEqual(messages[3].ruleId, "no-undef")
      assert.strictEqual(messages[3].line, 4)
      assert.strictEqual(messages[4].ruleId, "space-infix-ops")
      assert.strictEqual(messages[4].line, 4)
      assert.strictEqual(messages[5].ruleId, "no-undef")
      assert.strictEqual(messages[5].line, 4)
    })
  })

  describe("allow description", () => {
    it("disable all rules if <!-- eslint-disable -- description -->", async () => {
      const code = `
      <!-- eslint-disable -- description -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("enable all rules if <!-- eslint-enable -- description -->", async () => {
      const code = `
      <!-- eslint-disable -- description -->
      {@html a+b}
      <!-- eslint-enable -- description -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 4)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[0].line, 5)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 5)
      assert.strictEqual(messages[2].ruleId, "space-infix-ops")
      assert.strictEqual(messages[2].line, 5)
      assert.strictEqual(messages[3].ruleId, "no-undef")
      assert.strictEqual(messages[3].line, 5)
    })

    it("enable specific rules if <!-- eslint-enable space-infix-ops -- description -->", async () => {
      const code = `
      <!-- eslint-disable @ota-meshi/svelte/no-at-html-tags, space-infix-ops -- description -->
      {@html a+b}
      <!-- eslint-enable space-infix-ops -- description -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 5)
      assert.strictEqual(messages[0].ruleId, "no-undef")
      assert.strictEqual(messages[0].line, 3)
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[1].line, 3)
      assert.strictEqual(messages[2].ruleId, "no-undef")
      assert.strictEqual(messages[2].line, 5)
      assert.strictEqual(messages[3].ruleId, "space-infix-ops")
      assert.strictEqual(messages[3].line, 5)
      assert.strictEqual(messages[4].ruleId, "no-undef")
      assert.strictEqual(messages[4].line, 5)
    })

    it("disable all rules if <!-- eslint-disable-line -- description -->", async () => {
      const code = `
      {@html a+b} <!-- eslint-disable-line -- description -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("disable specific rules if <!-- eslint-disable-line space-infix-ops -- description -->", async () => {
      const code = `
      {@html a+b} <!-- eslint-disable-line space-infix-ops -- description -->
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 3)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "no-undef")
    })

    it("disable all rules if <!-- eslint-disable-next-line -- description -->", async () => {
      const code = `
      <!-- eslint-disable-next-line -- description -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 0)
    })

    it("disable specific rules if <!-- eslint-disable-next-line space-infix-ops -->", async () => {
      const code = `
      <!-- eslint-disable-next-line space-infix-ops -- description -->
      {@html a+b}
      `
      const result = await linter.lintText(code, { filePath: "test.svelte" })
      const messages = result[0].messages

      assert.strictEqual(messages.length, 3)
      assert.strictEqual(
        messages[0].ruleId,
        "@ota-meshi/svelte/no-at-html-tags",
      )
      assert.strictEqual(messages[1].ruleId, "no-undef")
      assert.strictEqual(messages[2].ruleId, "no-undef")
    })
  })

  // describe("reportUnusedDisableDirectives", () => {
  //   const linter = new eslint.CLIEngine({
  //     parser: require.resolve("vue-eslint-parser"),
  //     parserOptions: {
  //       ecmaVersion: 2015,
  //     },
  //     plugins: ["vue"],
  //     rules: {
  //       "no-unused-vars": "error",
  //       "vue/comment-directive": [
  //         "error",
  //         { reportUnusedDisableDirectives: true },
  //       ],
  //       "@ota-meshi/svelte/no-at-html-tags": "error",
  //       "space-infix-ops": "error",
  //     },
  //     useEslintrc: false,
  //   })
  //   it("report unused <!-- eslint-disable -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable -->
  //          <div id="a">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 1)
  //     assert.strictEqual(messages[0].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[0].message,
  //       "Unused eslint-disable directive (no problems were reported).",
  //     )
  //     assert.strictEqual(messages[0].line, 3)
  //     assert.strictEqual(messages[0].column, 11)
  //   })

  //   it("dont report unused <!-- eslint-disable -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable -->
  //          <div id id="a">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 0)
  //   })
  //   it("disable and report unused <!-- eslint-disable -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable -->
  //          <div id id="a">Hello</div>
  //          <!-- eslint-enable -->
  //          <!-- eslint-disable -->
  //          <div id="b">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 1)
  //     assert.strictEqual(messages[0].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[0].message,
  //       "Unused eslint-disable directive (no problems were reported).",
  //     )
  //     assert.strictEqual(messages[0].line, 6)
  //     assert.strictEqual(messages[0].column, 11)
  //   })

  //   it("report unused <!-- eslint-disable space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->
  //          <div id="a">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 2)

  //     assert.strictEqual(messages[0].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[0].message,
  //       "Unused eslint-disable directive (no problems were reported from 'space-infix-ops').",
  //     )
  //     assert.strictEqual(messages[0].line, 3)
  //     assert.strictEqual(messages[0].column, 31)

  //     assert.strictEqual(messages[1].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[1].message,
  //       "Unused eslint-disable directive (no problems were reported from '@ota-meshi/svelte/no-at-html-tags').",
  //     )
  //     assert.strictEqual(messages[1].line, 3)
  //     assert.strictEqual(messages[1].column, 60)
  //   })

  //   it("report unused <!-- eslint-disable-next-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable-next-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->
  //          <div id="a">Hello</div>
  //          <div id id="b">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 4)

  //     assert.strictEqual(messages[0].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[0].message,
  //       "Unused eslint-disable-next-line directive (no problems were reported from 'space-infix-ops').",
  //     )
  //     assert.strictEqual(messages[0].line, 3)
  //     assert.strictEqual(messages[0].column, 41)

  //     assert.strictEqual(messages[1].ruleId, "vue/comment-directive")
  //     assert.strictEqual(
  //       messages[1].message,
  //       "Unused eslint-disable-next-line directive (no problems were reported from '@ota-meshi/svelte/no-at-html-tags').",
  //     )
  //     assert.strictEqual(messages[1].line, 3)
  //     assert.strictEqual(messages[1].column, 70)

  //     assert.strictEqual(
  //       messages[2].ruleId,
  //       "@ota-meshi/svelte/no-at-html-tags",
  //     )
  //     assert.strictEqual(messages[2].line, 5)
  //     assert.strictEqual(messages[3].ruleId, "space-infix-ops")
  //     assert.strictEqual(messages[3].line, 5)
  //   })

  //   it("dont report used <!-- eslint-disable-next-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable-next-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->
  //          <div id id="a">Hello</div>
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 0)
  //   })

  //   it("dont report used, with duplicate eslint-disable", () => {
  //     const code = `
  //        <template>
  //          <!-- eslint-disable -->
  //          <!-- eslint-disable-next-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->
  //          <div id id="a">Hello</div><!-- eslint-disable-line space-infix-ops, @ota-meshi/svelte/no-at-html-tags -->
  //        </template>
  //      `
  //     const messages = linter.executeOnText(code, "test.vue").results[0]
  //       .messages

  //     assert.strictEqual(messages.length, 0)
  //   })
  // })
})
