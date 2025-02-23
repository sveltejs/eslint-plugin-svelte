import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type { RuleContext } from '../types.js';
import { getSvelteVersion } from '../utils/svelte-context.js';

const EXPECTED_PROP_NAMES = ['data', 'errors', 'form', 'snapshot'];
const EXPECTED_PROP_NAMES_SVELTE5 = [...EXPECTED_PROP_NAMES, 'children'];

function checkProp(
	node: TSESTree.VariableDeclarator,
	context: RuleContext,
	expectedPropNames: string[]
) {
	if (node.id.type !== 'ObjectPattern') return;
	for (const p of node.id.properties) {
		if (
			p.type === 'Property' &&
			p.value.type === 'Identifier' &&
			!expectedPropNames.includes(p.value.name)
		) {
			context.report({
				node: p.value,
				loc: p.value.loc,
				messageId: 'unexpected'
			});
		}
	}
}

export default createRule('valid-prop-names-in-kit-pages', {
	meta: {
		docs: {
			description: 'disallow props other than data or errors in SvelteKit page components.',
			category: 'SvelteKit',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: 'disallow props other than data or errors in SvelteKit page components.'
		},
		type: 'problem',
		conditions: [
			{
				svelteKitFileTypes: ['+page.svelte', '+error.svelte', '+layout.svelte']
			}
		]
	},
	create(context) {
		let isScript = false;
		const isSvelte5 = getSvelteVersion() === '5';
		const expectedPropNames = isSvelte5 ? EXPECTED_PROP_NAMES_SVELTE5 : EXPECTED_PROP_NAMES;
		return {
			// <script>
			'Program > SvelteScriptElement > SvelteStartTag': (node: AST.SvelteStartTag) => {
				// except for <script context="module">
				isScript = !node.attributes.some(
					(a) =>
						a.type === 'SvelteAttribute' &&
						a.key.name === 'context' &&
						a.value.some((v) => v.type === 'SvelteLiteral' && v.value === 'module')
				);
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
