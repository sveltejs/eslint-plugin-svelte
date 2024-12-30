import fs from 'fs';
import path from 'path';
import plugin from '../src/index.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

void main();

async function main() {
	const { pluginsToRulesDTS } = await import('eslint-typegen/core');

	// @ts-expect-error - types are a bit strict here
	const ruleTypes = await pluginsToRulesDTS({ svelte: plugin });

	void fs.writeFileSync(
		path.join(__dirname, '../src/rule-types.ts'),
		`// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"

${ruleTypes}`
	);
}
