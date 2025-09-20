import fs from 'fs';
import plugin from '../src/index.js';

void main();

async function main() {
	const { pluginsToRulesDTS } = await import('eslint-typegen/core');

	// @ts-expect-error - types are a bit strict here
	const ruleTypes = await pluginsToRulesDTS({ svelte: plugin });

	void fs.writeFileSync(
		new URL('../src/rule-types.ts', import.meta.url),
		`// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"

${ruleTypes}`
	);
}
