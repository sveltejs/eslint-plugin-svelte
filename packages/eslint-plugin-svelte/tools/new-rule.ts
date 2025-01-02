import path from 'node:path';
import fs from 'node:fs';
import cp from 'node:child_process';
import url from 'node:url';
import { writeAndFormat } from './lib/write.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
	const utilsPath = path.resolve(__dirname, `../src/utils/index.ts`);
	const testUtilsPath = path.resolve(__dirname, `../tests/utils/utils.ts`);

	const ruleFile = path.resolve(__dirname, `../src/rules/${ruleId}.ts`);
	const testFile = path.resolve(__dirname, `../tests/src/rules/${ruleId}.ts`);
	const docFile = path.resolve(__dirname, `../../../docs/rules/${ruleId}.md`);
	const fixturesRoot = path.resolve(__dirname, `../tests/fixtures/rules/${ruleId}/`);
	try {
		fs.mkdirSync(path.dirname(ruleFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.dirname(testFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.dirname(docFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.resolve(fixturesRoot, 'valid'), { recursive: true });
		fs.mkdirSync(path.resolve(fixturesRoot, 'invalid'), { recursive: true });
	} catch {
		// ignore
	}

	await writeAndFormat(
		ruleFile,
		`import { AST } from 'svelte-eslint-parser';
import { createRule } from '${getModulePath(ruleFile, utilsPath)}';

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
    },
    create(context) {
        
        return {}
    },
});
`
	);
	await writeAndFormat(
		testFile,
		`import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '${getModulePath(testFile, ruleFile)}';
import { loadTestCases } from '${getModulePath(testFile, testUtilsPath)}';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('${ruleId}', rule as any, loadTestCases('${ruleId}'));
`
	);
	await writeAndFormat(
		docFile,
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
		cp.execSync(`code "${ruleFile}"`);
		cp.execSync(`code "${testFile}"`);
		cp.execSync(`code "${docFile}"`);
	} catch {
		logger.error('Unable to find code command. Will not open files with VSCode.');
	}
})(process.argv.slice(2));

/** Get module path */
function getModulePath(from: string, module: string): string {
	return path.relative(path.dirname(from), module).replace(/.ts$/u, '.js');
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
