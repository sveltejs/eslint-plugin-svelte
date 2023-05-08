import assert from "assert"
import plugin from "../../src"
import { version } from "../../package.json"
const expectedMeta = {
  name: "eslint-plugin-svelte",
  version,
}

describe("Test for meta object", () => {
  it("A plugin should have a meta object.", () => {
    assert.deepStrictEqual(plugin.meta, expectedMeta)
  })

  for (const [name, processor] of Object.entries(plugin.processors)) {
    it(`"${name}" processor should have a meta object.`, () => {
      assert.deepStrictEqual(processor.meta, expectedMeta)
    })
  }
})
