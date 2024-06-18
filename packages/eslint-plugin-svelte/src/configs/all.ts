import type { Linter } from 'eslint';
import path from 'node:path';
import { rules } from '../utils/rules';
const base = require.resolve('./base');
const baseExtend = path.extname(`${base}`) === '.ts' ? 'plugin:svelte/base' : base;
const config: Linter.Config = {
	extends: [baseExtend],
	rules: Object.fromEntries(
		rules
			.map((rule) => [`svelte/${rule.meta.docs.ruleName}`, 'error'])
			.filter(
				([ruleName]) =>
					![
						// Does not work without options.
						'svelte/no-restricted-html-elements'
					].includes(ruleName)
			)
	)
};
export = config;
