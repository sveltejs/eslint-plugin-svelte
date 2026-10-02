import assert from 'assert';
import fs from 'fs';
import renderRulesTableContent from '../../tools/render-rules.js';
import { rules } from '../../src/utils/rules.js';

describe('Rules documentation', () => {
	it('lists extension rules in the documentation sidebar', () => {
		const source = fs.readFileSync(
			new URL('../../../../docs-svelte-kit/src/lib/utils.js', import.meta.url),
			'utf8'
		);
		const menuCode = source.slice(
			source.indexOf('const svelteRules ='),
			source.indexOf('const SIDE_MENU =')
		);
		const categories = new Function('rules', `${menuCode}\nreturn categoryRules;`)(rules);
		const extensionIds = categories
			.find((c: { title: string }) => c.title === 'Extension Rules')
			.children.map((c: { title: string }) => c.title);
		for (const rule of rules.filter((r) => r.meta.docs.extensionRule && !r.meta.deprecated)) {
			assert.ok(extensionIds.includes(rule.meta.docs.ruleId), rule.meta.docs.ruleId);
		}
	});

	it('lists all active extension rules in the Extension Rules section', () => {
		const table = renderRulesTableContent();
		const extensionSection = table.split('## Extension Rules\n')[1].split('\n## ')[0];
		for (const rule of rules.filter((r) => r.meta.docs.extensionRule && !r.meta.deprecated)) {
			assert.ok(extensionSection.includes(`[${rule.meta.docs.ruleId}]`), rule.meta.docs.ruleId);
		}
		assert.strictEqual(extensionSection.split('[svelte/prefer-const]').length - 1, 1);
		const bestPracticesSection = table.split('## Best Practices\n')[1].split('\n## ')[0];
		assert.ok(bestPracticesSection.includes('[svelte/prefer-const]'));
	});
});
