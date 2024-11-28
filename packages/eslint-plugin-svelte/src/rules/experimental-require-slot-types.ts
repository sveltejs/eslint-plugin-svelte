import { createRule } from '../utils/index.js';
import { getLangValue } from '../utils/ast-utils.js';

const SLOTS_TYPE_NAME = '$$Slots';

export default createRule('experimental-require-slot-types', {
	meta: {
		docs: {
			description: 'require slot type declaration using the `$$Slots` interface',
			category: 'Experimental',
			recommended: false
		},
		schema: [],
		messages: {
			missingSlotsInterface: `The component must define the $$Slots interface.`
		},
		type: 'suggestion'
	},
	create(context) {
		let isTs = false;
		let hasSlot = false;
		let hasDeclaredSlots = false;
		return {
			SvelteScriptElement(node) {
				const lang = getLangValue(node)?.toLowerCase();
				isTs = lang === 'ts' || lang === 'typescript';
			},
			SvelteElement(node) {
				if (node.name.type === 'SvelteName' && node.name.name === 'slot') {
					hasSlot = true;
				}
			},
			TSInterfaceDeclaration(node) {
				if (node.id.name === SLOTS_TYPE_NAME) {
					hasDeclaredSlots = true;
				}
			},
			TSTypeAliasDeclaration(node) {
				if (node.id.name === SLOTS_TYPE_NAME) {
					hasDeclaredSlots = true;
				}
			},
			'Program:exit'() {
				if (isTs && hasSlot && !hasDeclaredSlots) {
					context.report({
						loc: {
							line: 1,
							column: 1
						},
						messageId: 'missingSlotsInterface'
					});
				}
			}
		};
	}
});
