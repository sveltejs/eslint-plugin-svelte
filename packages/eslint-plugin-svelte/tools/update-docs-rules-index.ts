import path from 'path';
import renderRulesTableContent from './render-rules.js';
import { writeAndFormat } from './lib/write.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// -----------------------------------------------------------------------------
const readmeFilePath = path.resolve(__dirname, '../../../docs/rules.md');
void writeAndFormat(
	readmeFilePath,
	`---
sidebarDepth: 0
---

# Available Rules

:wrench: Indicates that the rule is fixable, and using \`--fix\` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the reported problems.\\
:bulb: Indicates that some problems reported by the rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\\
:star: Indicates that the rule is included in the \`plugin:svelte/recommended\` config.

<!-- This file is automatically generated in tools/update-docs-rules-index.js, do not change! -->
${renderRulesTableContent()}`
);
