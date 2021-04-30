import path from "path"
import fs from "fs"
import cp from "child_process"
const logger = console

// main
;((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: npm run new <RuleID>")
    process.exitCode = 1
    return
  }
  if (!/^[\w-]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId)
    process.exitCode = 1
    return
  }

  const ruleFile = path.resolve(__dirname, `../src/rules/${ruleId}.ts`)
  const testFile = path.resolve(__dirname, `../tests/src/rules/${ruleId}.ts`)
  const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)
  const fixturesRoot = path.resolve(
    __dirname,
    `../tests/fixtures/rules/${ruleId}/`,
  )
  try {
    fs.mkdirSync(fixturesRoot)
    fs.mkdirSync(path.resolve(fixturesRoot, "valid"))
    fs.mkdirSync(path.resolve(fixturesRoot, "invalid"))
  } catch {
    // ignore
  }

  fs.writeFileSync(
    ruleFile,
    `import { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"

export default createRule("${ruleId}", {
    meta: {
        docs: {
            description: "",
            recommended: true,
        },
        schema: [],
        messages: {},
        type: "suggestion", // "problem",
    },
    create(context) {
        
        return {}
    },
})
`,
  )
  fs.writeFileSync(
    testFile,
    `import { RuleTester } from "eslint"
import rule from "../../../src/rules/${ruleId}"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

tester.run("${ruleId}", rule as any, loadTestCases("${ruleId}"))
`,
  )
  fs.writeFileSync(
    docFile,
    `#  (@ota-meshi/svelte/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<eslint-code-block>

<!--eslint-skip-->

\`\`\`html
<script>
  /* eslint @ota-meshi/svelte/${ruleId}: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->

\`\`\`

</eslint-code-block>

## :wrench: Options

\`\`\`json
{
  "@ota-meshi/svelte/${ruleId}": ["error", {
   
  }]
}
\`\`\`

- 

## :books: Further Reading

- 

`,
  )

  cp.execSync(`code "${ruleFile}"`)
  cp.execSync(`code "${testFile}"`)
  cp.execSync(`code "${docFile}"`)
})(process.argv[2])
