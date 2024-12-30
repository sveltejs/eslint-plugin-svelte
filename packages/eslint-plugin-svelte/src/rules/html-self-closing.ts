import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getNodeName, isVoidHtmlElement, isForeignElement } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

const TYPE_MESSAGES = {
	normal: 'HTML elements',
	void: 'HTML void elements',
	foreign: 'foreign (SVG or MathML) elements',
	component: 'Svelte custom components',
	svelte: 'Svelte special elements'
};

type ElementTypes = 'normal' | 'void' | 'foreign' | 'component' | 'svelte';

export default createRule('html-self-closing', {
	meta: {
		docs: {
			description: 'enforce self-closing style',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: true
		},
		type: 'layout',
		fixable: 'code',
		messages: {
			requireClosing: 'Require self-closing on {{type}}.',
			disallowClosing: 'Disallow self-closing on {{type}}.'
		},
		schema: [
			{
				anyOf: [
					{
						properties: {
							void: {
								enum: ['never', 'always', 'ignore']
							},
							normal: {
								enum: ['never', 'always', 'ignore']
							},
							foreign: {
								enum: ['never', 'always', 'ignore']
							},
							component: {
								enum: ['never', 'always', 'ignore']
							},
							svelte: {
								enum: ['never', 'always', 'ignore']
							}
						},
						additionalProperties: false
					},
					{
						enum: ['all', 'html', 'none']
					}
				]
			}
		]
	},
	create(context) {
		let options = {
			void: 'always',
			normal: 'always',
			foreign: 'always',
			component: 'always',
			svelte: 'always'
		};

		const option = context.options?.[0];
		switch (option) {
			case 'none':
				options = {
					void: 'never',
					normal: 'never',
					foreign: 'never',
					component: 'never',
					svelte: 'never'
				};
				break;
			case 'html':
				options = {
					void: 'always',
					normal: 'never',
					foreign: 'always',
					component: 'never',
					svelte: 'always'
				};
				break;
			default:
				if (typeof option !== 'object' || option === null) break;

				options = {
					...options,
					...option
				};

				break;
		}

		/**
		 * Get SvelteElement type.
		 * If element is custom component "component" is returned
		 * If element is svelte special element such as svelte:self "svelte" is returned
		 * If element is void element "void" is returned
		 * otherwise "normal" is returned
		 */
		function getElementType(node: AST.SvelteElement): ElementTypes {
			if (node.kind === 'component') return 'component';
			if (node.kind === 'special') return 'svelte';
			if (isVoidHtmlElement(node)) return 'void';
			if (isForeignElement(node)) return 'foreign';
			return 'normal';
		}

		/**
		 * Returns true if element has no children, or has only whitespace text
		 */
		function isElementEmpty(node: AST.SvelteElement): boolean {
			if (node.children.length <= 0) return true;

			for (const child of node.children) {
				if (child.type !== 'SvelteText') return false;
				if (!/^\s*$/.test(child.value)) return false;
			}

			return true;
		}

		/**
		 * Report
		 */
		function report(node: AST.SvelteElement, shouldBeClosed: boolean) {
			const elementType = getElementType(node);

			context.report({
				node,
				loc: {
					start: getSourceCode(context).getLocFromIndex(
						node.startTag.range[1] - (node.startTag.selfClosing ? 2 : 1)
					),
					end: node.loc.end
				},
				messageId: shouldBeClosed ? 'requireClosing' : 'disallowClosing',
				data: {
					type: TYPE_MESSAGES[elementType]
				},
				*fix(fixer) {
					if (shouldBeClosed) {
						for (const child of node.children) {
							yield fixer.removeRange(child.range);
						}

						yield fixer.insertTextBeforeRange(
							[node.startTag.range[1] - 1, node.startTag.range[1]],
							'/'
						);

						if (node.endTag) yield fixer.removeRange(node.endTag.range);
					} else {
						yield fixer.removeRange([node.startTag.range[1] - 2, node.startTag.range[1] - 1]);

						if (!isVoidHtmlElement(node))
							yield fixer.insertTextAfter(node, `</${getNodeName(node)}>`);
					}
				}
			});
		}

		return {
			SvelteElement(node: AST.SvelteElement) {
				if (!isElementEmpty(node)) return;

				const elementType = getElementType(node);

				const elementTypeOptions = options[elementType];
				if (elementTypeOptions === 'ignore') return;
				const shouldBeClosed = elementTypeOptions === 'always';

				if (shouldBeClosed && !node.startTag.selfClosing) {
					report(node, true);
				} else if (!shouldBeClosed && node.startTag.selfClosing) {
					report(node, false);
				}
			}
		};
	}
});
