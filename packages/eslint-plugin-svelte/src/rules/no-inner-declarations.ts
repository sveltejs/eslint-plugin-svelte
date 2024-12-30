import { createRule } from '../utils/index.js';
import {
	buildProxyListener,
	defineWrapperListener,
	getCoreRule,
	getProxyNode
} from '../utils/eslint-core.js';

const coreRule = getCoreRule('no-inner-declarations');

export default createRule('no-inner-declarations', {
	meta: {
		...coreRule.meta,
		docs: {
			description: 'disallow variable or `function` declarations in nested blocks',
			category: 'Extension Rules',
			recommended: true,
			extensionRule: 'no-inner-declarations'
		},
		fixable: coreRule.meta.fixable,
		schema: coreRule.meta.schema,
		messages: coreRule.meta.messages,
		type: coreRule.meta.type
	},
	create(context) {
		return defineWrapperListener(coreRule, context, {
			createListenerProxy(coreListener) {
				return buildProxyListener(coreListener, (node) => {
					return getProxyNode(node, {
						get parent() {
							if (node.parent?.type === 'SvelteScriptElement') {
								return node.parent.parent;
							}
							return node.parent;
						}
					});
				});
			}
		});
	}
});
