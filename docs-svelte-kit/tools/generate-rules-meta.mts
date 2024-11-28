import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rules as pluginRules } from 'eslint-plugin-svelte';
const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Generate rules-meta files */
export default function generateRulesMeta(): void {
	const rules = Object.values(pluginRules);
	const distPath = path.join(dirname, '../src/lib/rules-meta.js');

	fs.mkdirSync(path.dirname(distPath), { recursive: true });
	fs.writeFileSync(
		distPath,
		`
export const rules = ${JSON.stringify(
			rules.map((rule) => ({ meta: rule.meta })),
			null,
			2
		)}		`,
		'utf-8'
	);
}
