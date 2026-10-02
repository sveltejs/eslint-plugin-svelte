import assert from 'assert';
import renderRulesTableContent from '../../tools/render-rules.js';
import { rules } from '../../src/utils/rules.js';

describe('Rules documentation', () => {
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
