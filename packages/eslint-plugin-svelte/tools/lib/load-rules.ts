import path from 'path';
import fs from 'fs';
import type { RuleModule } from '../../src/types.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
async function readRules() {
	const rulesLibRoot = path.resolve(__dirname, '../../src/rules');
	const rules: RuleModule[] = [];
	for (const name of iterateTsFiles()) {
		const module = await import(path.join(rulesLibRoot, name));
		const rule: RuleModule = module && module.default;
		if (!rule || typeof rule.create !== 'function') {
			continue;
		}

		rules.push(rule);
	}
	return rules;
}

export const rules = await readRules();

/** Iterate ts files */
function* iterateTsFiles() {
	const rulesLibRoot = path.resolve(__dirname, '../../src/rules');
	const files = fs.readdirSync(rulesLibRoot);

	while (files.length) {
		const file = files.shift()!;
		if (file.endsWith('.ts')) {
			yield file;
			continue;
		}
		const filePath = path.join(rulesLibRoot, file);
		if (!fs.statSync(filePath).isDirectory()) {
			continue;
		}
		files.unshift(...fs.readdirSync(filePath).map((n) => path.join(file, n)));
	}
}
