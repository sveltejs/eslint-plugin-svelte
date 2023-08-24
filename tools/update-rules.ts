import path from 'path';
// import eslint from "eslint"
import { rules } from './lib/load-rules';
import { writeAndFormat } from './lib/write';

/**
 * Convert text to camelCase
 */
function camelCase(str: string) {
	return str.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ''));
}

/**
 * Convert text to identifier
 */
function toIdentifier(str: string) {
	const clean = str
		.replace(/^[^\p{ID_Start}$_]/u, '')
		.replace(/[^\p{ID_Continue}$\u200c\u200d]/gu, '-');

	return camelCase(clean);
}

const content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
import type { RuleModule } from "../types"
${rules
	.map(
		(rule) =>
			`import ${toIdentifier(rule.meta.docs.ruleName)} from "../rules/${rule.meta.docs.ruleName}"`
	)
	.join('\n')}

export const rules = [
    ${rules.map((rule) => toIdentifier(rule.meta.docs.ruleName)).join(',')}
] as RuleModule[]
`;

const filePath = path.resolve(__dirname, '../src/utils/rules.ts');

// Update file.
void writeAndFormat(filePath, content);
