import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type { RuleContext } from '../types.js';
import { getSvelteContext, getSvelteVersion } from '../utils/svelte-context.js';

const PAGE_PROP_NAMES = ['data', 'form', 'params', 'snapshot'];
const LEGACY_PAGE_PROP_NAMES = [...PAGE_PROP_NAMES, 'errors'];
const LAYOUT_PROP_NAMES = [...PAGE_PROP_NAMES, 'children'];
const ERROR_PROP_NAMES = ['error'];

function checkProp(
	node: TSESTree.VariableDeclarator,
	context: RuleContext,
	expectedPropNames: string[]
) {
	if (node.id.type !== 'ObjectPattern') return;
	for (const p of node.id.properties) {
		if (
			p.type === 'Property' &&
			p.key.type === 'Identifier' &&
			!expectedPropNames.includes(p.key.name)
		) {
			context.report({
				node: p.key,
				loc: p.key.loc,
				messageId: 'unexpected'
			});
		}
	}
}

function isModuleScript(node: AST.SvelteAttribute) {
	// <script context="module">
	if (
		node.key.name === 'context' &&
		node.value.some((v) => v.type === 'SvelteLiteral' && v.value === 'module')
	) {
		return true;
	}

	// <script module>
	if (node.key.name === 'module' && node.value.length === 0) {
		return true;
	}

	return false;
}

export default createRule('valid-prop-names-in-kit-pages', {
	meta: {
		docs: {
			description: 'disallow invalid props in SvelteKit route components.',
			category: 'SvelteKit',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: 'disallow invalid props in SvelteKit route components.'
		},
		type: 'problem',
		conditions: [
			{
				svelteKitFileTypes: ['+page.svelte', '+layout.svelte', '+error.svelte']
			}
		]
	},
	create(context) {
		let isScript = false;
		const isSvelte5 = getSvelteVersion() === '5';
		const svelteContext = getSvelteContext(context);
		const fileType = svelteContext?.svelteKitFileType;

		let expectedPropNames;
		if (isSvelte5) {
			if (fileType === '+layout.svelte') {
				expectedPropNames = LAYOUT_PROP_NAMES;
			} else if (fileType === '+error.svelte') {
				expectedPropNames = ERROR_PROP_NAMES;
			} else {
				expectedPropNames = PAGE_PROP_NAMES;
			}
		} else {
			expectedPropNames = LEGACY_PAGE_PROP_NAMES;
		}

		return {
			// <script>
			'Program > SvelteScriptElement > SvelteStartTag': (node: AST.SvelteStartTag) => {
				// except for <script context="module">
				isScript = !node.attributes.some((a) => a.type === 'SvelteAttribute' && isModuleScript(a));
			},

			// </script>
			'Program > SvelteScriptElement:exit': () => {
				isScript = false;
			},

			// Svelte3,4
			'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator': (
				node: TSESTree.VariableDeclarator
			) => {
				if (!isScript) return;

				// export let foo
				if (node.id.type === 'Identifier') {
					if (!expectedPropNames.includes(node.id.name)) {
						context.report({
							node,
							loc: node.loc,
							messageId: 'unexpected'
						});
					}
					return;
				}

				// export let { xxx, yyy } = zzz
				checkProp(node, context, expectedPropNames);
			},

			// Svelte5
			// let { foo, bar } = $props();
			'VariableDeclaration > VariableDeclarator': (node: TSESTree.VariableDeclarator) => {
				if (!isScript) return;
				if (
					node.init?.type !== 'CallExpression' ||
					node.init.callee?.type !== 'Identifier' ||
					node.init.callee?.name !== '$props'
				) {
					return;
				}

				checkProp(node, context, expectedPropNames);
			}
		};
	}
});
