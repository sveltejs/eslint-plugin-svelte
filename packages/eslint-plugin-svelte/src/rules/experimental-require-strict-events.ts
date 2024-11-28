import type { AST } from 'svelte-eslint-parser';

import { createRule } from '../utils/index.js';
import { findAttribute, getLangValue } from '../utils/ast-utils.js';

const EVENTS_TYPE_NAME = '$$Events';

export default createRule('experimental-require-strict-events', {
	meta: {
		docs: {
			description: 'require the strictEvents attribute on `<script>` tags',
			category: 'Experimental',
			recommended: false
		},
		schema: [],
		messages: {
			missingStrictEvents: `The component must have the strictEvents attribute on its <script> tag or it must define the $$Events interface.`
		},
		type: 'suggestion'
	},
	create(context) {
		let isTs = false;
		let hasAttribute = false;
		let hasDeclaredEvents = false;
		let scriptNode: AST.SvelteScriptElement;
		return {
			SvelteScriptElement(node) {
				const lang = getLangValue(node)?.toLowerCase();
				isTs = lang === 'ts' || lang === 'typescript';
				hasAttribute = findAttribute(node, 'strictEvents') !== null;
				scriptNode = node;
			},
			TSInterfaceDeclaration(node) {
				if (node.id.name === EVENTS_TYPE_NAME) {
					hasDeclaredEvents = true;
				}
			},
			TSTypeAliasDeclaration(node) {
				if (node.id.name === EVENTS_TYPE_NAME) {
					hasDeclaredEvents = true;
				}
			},
			'Program:exit'() {
				if (isTs && !hasAttribute && !hasDeclaredEvents) {
					context.report({
						node: scriptNode,
						messageId: 'missingStrictEvents'
					});
				}
			}
		};
	}
});
