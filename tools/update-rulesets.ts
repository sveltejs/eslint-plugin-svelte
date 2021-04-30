import path from "path"
import fs from "fs"
import { rules } from "./lib/load-rules"

const content = `
import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(\`\${base}\`) === ".ts" ? "plugin:@ota-meshi/svelte/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // @ota-meshi/eslint-plugin-svelte rules
        ${rules
          .filter((rule) => rule.meta.docs.recommended && !rule.meta.deprecated)
          .map((rule) => {
            const conf = rule.meta.docs.default || "error"
            return `"${rule.meta.docs.ruleId}": "${conf}"`
          })
          .join(",\n")}
    },
}
`

const filePath = path.resolve(__dirname, "../src/configs/recommended.ts")

// Update file.
fs.writeFileSync(filePath, content)

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
