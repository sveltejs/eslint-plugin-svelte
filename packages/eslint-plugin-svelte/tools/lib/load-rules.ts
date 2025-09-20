import path from 'path';
import fs from 'fs';
import type { RuleModule } from '../../src/types.js';

const rulesLibRootURL = new URL('../../src/rules/', import.meta.url);

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
async function readRules() {
	const rules: RuleModule[] = [];
	for (const name of iterateTsFiles()) {
		const module = await import(new URL(name, rulesLibRootURL).href);
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
	const files = fs.readdirSync(rulesLibRootURL);

	while (files.length) {
		const file = files.shift()!;
		if (file.endsWith('.ts')) {
			yield file;
			continue;
		}
		const filePathURL = new URL(file, rulesLibRootURL);
		if (!fs.statSync(filePathURL).isDirectory()) {
			continue;
		}
		files.unshift(...fs.readdirSync(filePathURL).map((n) => path.join(file, n)));
	}
}
