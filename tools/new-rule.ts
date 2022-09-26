import path from "path"
import fs from "fs"
import cp from "child_process"
const logger = console

// main
;((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: yarn new <RuleID>")
    process.exitCode = 1
    return
  }
  if (!/^[\w\-/@]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId)
    process.exitCode = 1
    return
  }
  const utilsPath = path.resolve(__dirname, `../src/utils`)
  const testUtilsPath = path.resolve(__dirname, `../tests/utils/utils.ts`)

  const ruleFile = path.resolve(__dirname, `../src/rules/${ruleId}.ts`)
  const testFile = path.resolve(__dirname, `../tests/src/rules/${ruleId}.ts`)
  const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)
  const fixturesRoot = path.resolve(
    __dirname,
    `../tests/fixtures/rules/${ruleId}/`,
  )
  try {
    fs.mkdirSync(path.dirname(ruleFile), { recursive: true })
  } catch {
    // ignore
  }
  try {
    fs.mkdirSync(path.dirname(testFile), { recursive: true })
  } catch {
    // ignore
  }
  try {
    fs.mkdirSync(path.dirname(docFile), { recursive: true })
  } catch {
    // ignore
  }
  try {
    fs.mkdirSync(path.resolve(fixturesRoot, "valid"), { recursive: true })
    fs.mkdirSync(path.resolve(fixturesRoot, "invalid"), { recursive: true })
  } catch {
    // ignore
  }

  fs.writeFileSync(
    ruleFile,
    `import { AST } from "svelte-eslint-parser"
import { createRule } from "${getModulePath(ruleFile, utilsPath)}"

export default createRule("${ruleId}", {
    meta: {
        docs: {
            description: "",
            category: "",
            recommended: false,
        },
        schema: [],
        messages: {},
        type: "suggestion", // "problem", or "layout",
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
import rule from "${getModulePath(testFile, ruleFile)}"
import { loadTestCases } from "${getModulePath(testFile, testUtilsPath)}"

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
    `#  (svelte/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock>

<!--eslint-skip-->

\`\`\`svelte
<script>
  /* eslint svelte/${ruleId}: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->

\`\`\`

</ESLintCodeBlock>

## :wrench: Options

\`\`\`json
{
  "svelte/${ruleId}": ["error", {
   
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

/** Get module path */
function getModulePath(from: string, module: string): string {
  return path.relative(path.dirname(from), module).replace(/.ts$/u, "")
}
