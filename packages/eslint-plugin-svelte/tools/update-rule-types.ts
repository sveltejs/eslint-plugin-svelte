import fs from 'fs';
import plugin from '../src/index.js';

void main();

async function main() {
	const { pluginsToRulesDTS } = await import('eslint-typegen/core');

	const ruleTypes = await pluginsToRulesDTS(
		{ svelte: plugin },
		{ includeAugmentation: false, includeTypeImports: false }
	);

	void fs.writeFileSync(
		new URL('../src/rule-types.ts', import.meta.url),
		`// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"

/* eslint-disable */
/* prettier-ignore */
import type { Linter } from 'eslint'

declare module 'eslint' {
	interface RulesConfig extends RuleOptions {}
}

${ruleTypes}`
	);
}
