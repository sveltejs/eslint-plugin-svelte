import path from 'node:path';
import fs from 'node:fs';
import cp from 'node:child_process';
import { writeAndFormat } from './lib/write.js';
import { fileURLToPath } from 'node:url';

const logger = console;

// main
void (async ([ruleId, ...args]) => {
	if (ruleId == null) {
		logger.error('Usage: pnpm run new <RuleID>');
		process.exitCode = 1;
		return;
	}
	if (!/^[\w\-/@]+$/u.test(ruleId)) {
		logger.error("Invalid RuleID '%s'.", ruleId);
		process.exitCode = 1;
		return;
	}
	const utilsURL = new URL(`../src/utils/index.ts`, import.meta.url);
	const testUtilsURL = new URL(`../tests/utils/utils.ts`, import.meta.url);

	const ruleFileURL = new URL(`../src/rules/${ruleId}.ts`, import.meta.url);
	const testFileURL = new URL(`../tests/src/rules/${ruleId}.ts`, import.meta.url);
	const docFileURL = new URL(`../../../docs/rules/${ruleId}.md`, import.meta.url);
	const fixturesRootURL = new URL(`../tests/fixtures/rules/${ruleId}/`, import.meta.url);
	try {
		fs.mkdirSync(new URL('./', ruleFileURL), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(new URL('./', testFileURL), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(new URL('./', docFileURL), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(new URL('./valid', fixturesRootURL), { recursive: true });
		fs.mkdirSync(new URL('./invalid', fixturesRootURL), { recursive: true });
	} catch {
		// ignore
	}

	await writeAndFormat(
		ruleFileURL,
		`import { AST } from 'svelte-eslint-parser';
import { createRule } from '${getModulePath(ruleFileURL, utilsURL)}';

export default createRule('${ruleId}', {
    meta: {
        docs: {
            description: '',
            category: '',
            recommended: false,
        },
        schema: [],
        messages: {},
        type: 'suggestion', // 'problem', or 'layout',
				conditions: [], // Conditions for applying this rule. Leave empty to always execute.
    },
    create(context) {
        return {}
    },
});
`
	);
	await writeAndFormat(
		testFileURL,
		`import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '${getModulePath(testFileURL, ruleFileURL)}';
import { loadTestCases } from '${getModulePath(testFileURL, testUtilsURL)}';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('${ruleId}', rule as any, loadTestCases('${ruleId}'));
`
	);
	await writeAndFormat(
		docFileURL,
		`#  (svelte/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<!--eslint-skip-->

\`\`\`svelte
<script>
  /* eslint svelte/${ruleId}: "error" */
</script>

<!-- ✓ GOOD -->

<!-- ✗ BAD -->

\`\`\`

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

`
	);

	const { code } = expectedArgs(args);
	if (!code) {
		return;
	}

	try {
		// Use code -v to know if vscode is installed and do not print anything to the console
		cp.execSync('code -v', { stdio: 'ignore' });
		cp.execSync(`code "${fileURLToPath(ruleFileURL)}"`);
		cp.execSync(`code "${fileURLToPath(testFileURL)}"`);
		cp.execSync(`code "${fileURLToPath(docFileURL)}"`);
	} catch {
		logger.error('Unable to find code command. Will not open files with VSCode.');
	}
})(process.argv.slice(2));

/** Get module path */
function getModulePath(from: URL, module: URL): string {
	const fromDir = fileURLToPath(new URL('./', from));
	const modulePath = fileURLToPath(module);

	return path.relative(fromDir, modulePath).replace(/\\/g, '/').replace(/.ts$/u, '.js');
}

/** Argument parsing */
function expectedArgs(args: string[]) {
	const result = { code: false };

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const split = args[i].split('=');
		if (arg === '--code') {
			// Passing --code alone is the same as --code=true
			result.code = args[i + 1] === 'true' || args[i + 1] === undefined;
		} else if (split.length === 2) {
			result.code = split[1] === 'true';
		} else if (split.length > 2) {
			logger.error('Usage: pnpm run new <RuleID> <--code=boolean>');
		}
	}

	return result;
}
