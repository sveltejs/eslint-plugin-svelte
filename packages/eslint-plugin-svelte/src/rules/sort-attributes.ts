import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getAttributeKeyText } from '../utils/ast-utils.js';
import { toRegExp } from '../utils/regexp.js';
import { getSourceCode } from '../utils/compat.js';

type UserOrderObjectOption = {
	match: string | string[];
	sort: 'alphabetical' | 'ignore';
};
type UserOrderOption = string | string[] | UserOrderObjectOption;

type ParsedOption = {
	ignore: (keyText: string) => boolean;
	compare: (a: string, b: string) => number;
};

type CompiledOption = {
	match: (str: string) => boolean;
	sort: 'alphabetical' | 'ignore';
};

type Attr = AST.SvelteStartTag['attributes'][number];
type HasKeyAttr = Exclude<Attr, AST.SvelteSpreadAttribute>;

const DEFAULT_ORDER: UserOrderOption[] = [
	// `this` property.
	'this',
	// `bind:this` directive.
	'bind:this',
	// `id` attribute.
	'id',
	// `name` attribute.
	'name',
	// `slot` attribute.
	'slot',
	// `--style-props` (Alphabetical order within the same group.)
	{ match: '/^--/u', sort: 'alphabetical' },
	// `style` attribute, and `style:` directives.
	['style', '/^style:/u'],
	// `class` attribute.
	'class',
	// `class:` directives. (Alphabetical order within the same group.)
	{ match: '/^class:/u', sort: 'alphabetical' },
	// other attributes. (Alphabetical order within the same group.)
	{
		match: ['!/:/u', '!/^(?:this|id|name|style|class)$/u', '!/^--/u'],
		sort: 'alphabetical'
	},
	// `bind:` directives (other then `bind:this`), and `on:` directives.
	['/^bind:/u', '!bind:this', '/^on:/u'],
	// `use:` directives. (Alphabetical order within the same group.)
	{ match: '/^use:/u', sort: 'alphabetical' },
	// `transition:` directives. (Alphabetical order within the same group.)
	{ match: '/^transition:/u', sort: 'alphabetical' },
	// `in:` directives. (Alphabetical order within the same group.)
	{ match: '/^in:/u', sort: 'alphabetical' },
	// `out:` directives. (Alphabetical order within the same group.)
	{ match: '/^out:/u', sort: 'alphabetical' },
	// `animate:` directives. (Alphabetical order within the same group.)
	{ match: '/^animate:/u', sort: 'alphabetical' },
	// `let:` directives. (Alphabetical order within the same group.)
	{ match: '/^let:/u', sort: 'alphabetical' }
];

/** Parse options */
function parseOption(option?: { order: UserOrderOption[] }): ParsedOption {
	const order: UserOrderOption[] = option?.order ?? DEFAULT_ORDER;

	const compiled: CompiledOption[] = order.map(compileOption);

	return {
		ignore: (key) => {
			return !compiled.some((c) => c.match(key));
		},
		compare: (a, b) => {
			for (const c of compiled) {
				const matchA = c.match(a);
				const matchB = c.match(b);
				if (matchA && matchB) {
					if (c.sort === 'alphabetical') {
						return a === b ? 0 : a < b ? -1 : 1;
					}
					return 0;
				}
				if (matchA) {
					return -1;
				}
				if (matchB) {
					return 1;
				}
			}
			throw new Error('Illegal state');
		}
	};
}

/** Compile order option */
function compileOption(option: UserOrderOption): CompiledOption {
	const cache: Record<string, boolean> = {};
	const compiled = compileOptionWithoutCache(option);

	return {
		match: (str) => {
			if (cache[str] != null) return cache[str];
			return (cache[str] = compiled.match(str));
		},
		sort: compiled.sort
	};

	/** Compile order option without cache */
	function compileOptionWithoutCache(option: UserOrderOption): CompiledOption {
		if (typeof option === 'string') {
			const match = compileMatcher([option]);
			return { match, sort: 'ignore' };
		}
		if (Array.isArray(option)) {
			const match = compileMatcher(option);
			return { match, sort: 'ignore' };
		}
		const { match } = compileOptionWithoutCache(option.match);
		return { match, sort: option.sort || 'ignore' };
	}
}

/** Compile matcher */
function compileMatcher(pattern: string[]): (str: string) => boolean {
	const rules: { negative: boolean; match: (str: string) => boolean }[] = [];
	for (const p of pattern) {
		let negative: boolean, patternStr: string;
		if (p.startsWith('!')) {
			// If there is `!` at the beginning, it will be parsed with a negative pattern.
			negative = true;
			patternStr = p.substring(1);
		} else {
			negative = false;
			patternStr = p;
		}
		const regex = toRegExp(patternStr);
		rules.push({ negative, match: (str) => regex.test(str) });
	}
	return (str) => {
		// If the first rule is a negative pattern, they are considered to match if they do not match that pattern.
		let result = Boolean(rules[0]?.negative);
		for (const { negative, match } of rules) {
			if (result === !negative) {
				// Even if it matches, the result does not change, so skip it.
				continue;
			}
			if (match(str)) {
				result = !negative;
			}
		}
		return result;
	};
}

export default createRule('sort-attributes', {
	meta: {
		docs: {
			description: 'enforce order of attributes',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					order: {
						type: 'array',
						items: {
							anyOf: [
								{ type: 'string' },
								{
									type: 'array',
									items: {
										type: 'string'
									},
									uniqueItems: true,
									minItems: 1
								},
								{
									type: 'object',
									properties: {
										match: {
											anyOf: [
												{ type: 'string' },
												{
													type: 'array',
													items: {
														type: 'string'
													},
													uniqueItems: true,
													minItems: 1
												}
											]
										},
										sort: {
											enum: ['alphabetical', 'ignore']
										}
									},
									required: ['match', 'sort'],
									additionalProperties: false
								}
							]
						},
						uniqueItems: true,
						additionalItems: false
					},
					alphabetical: { type: 'boolean' }
				},
				additionalProperties: false
			}
		],
		messages: {
			shouldBefore: "Attribute '{{currentKey}}' should go before '{{prevKey}}'."
		},
		type: 'layout',
		fixable: 'code'
	},
	create(context) {
		const option = parseOption(context.options[0]);

		const cacheKeyText = new Map<HasKeyAttr, string>();

		/** Get key text */
		function getKeyText(node: HasKeyAttr) {
			const k = cacheKeyText.get(node);
			if (k != null) return k;

			const result = getAttributeKeyText(node, context);
			cacheKeyText.set(node, result);
			return result;
		}

		/** Report */
		function report(node: HasKeyAttr, previousNode: HasKeyAttr) {
			const currentKey = getKeyText(node);
			const prevKey = getKeyText(previousNode);
			context.report({
				node,
				messageId: 'shouldBefore',
				data: {
					currentKey,
					prevKey
				},

				fix(fixer) {
					const attributes = node.parent.attributes;

					const previousNodes = attributes.slice(
						attributes.indexOf(previousNode),
						attributes.indexOf(node)
					);
					const moveNodes = [node, ...previousNodes];
					const sourceCode = getSourceCode(context);
					return moveNodes.map((moveNode, index) => {
						const text = sourceCode.getText(moveNode);
						return fixer.replaceText(previousNodes[index] || node, text);
					});
				}
			});
		}

		/**
		 * Checks whether have a spread attribute between the node and the previous node.
		 */
		function hasSpreadAttribute(
			node: AST.SvelteAttribute,
			previousNode: HasKeyAttr
		): node is AST.SvelteAttribute {
			const attributes = node.parent.attributes;
			const previousNodes = attributes.slice(
				attributes.indexOf(previousNode),
				attributes.indexOf(node)
			);
			return previousNodes.some((a) => a.type === 'SvelteSpreadAttribute');
		}

		/**
		 * Verify the order for which the spread attribute exists.
		 */
		function verifyForSpreadAttributeExist(node: AST.SvelteAttribute) {
			const previousNodes: HasKeyAttr[] = [];
			const attributes = node.parent.attributes;
			for (const previousNode of attributes.slice(0, attributes.indexOf(node)).reverse()) {
				if (previousNode.type === 'SvelteSpreadAttribute') {
					break;
				}
				previousNodes.unshift(previousNode);
			}
			const key = getKeyText(node);
			const invalidPreviousNode = previousNodes.find((previousNode) => {
				const prevKey = getKeyText(previousNode);
				if (option.ignore(prevKey)) {
					return false;
				}

				return option.compare(prevKey, key) > 0;
			});

			if (invalidPreviousNode) {
				report(node, invalidPreviousNode);
			}
		}

		return {
			SvelteStartTag(node) {
				const validPreviousNodes: HasKeyAttr[] = [];
				for (const attr of node.attributes) {
					if (attr.type === 'SvelteSpreadAttribute') {
						continue;
					}
					const key = getKeyText(attr);
					if (option.ignore(key)) {
						continue;
					}
					const invalidPreviousNode = validPreviousNodes.find(
						(previousNode) => option.compare(getKeyText(previousNode), key) > 0
					);
					if (invalidPreviousNode) {
						if (attr.type !== 'SvelteAttribute' || !hasSpreadAttribute(attr, invalidPreviousNode)) {
							report(attr, invalidPreviousNode);
						} else {
							// Verify the order for which the spread attribute exists.
							verifyForSpreadAttributeExist(attr);
						}
						continue;
					}

					validPreviousNodes.push(attr);
				}
			}
		};
	}
});
