import type { AST } from 'svelte-eslint-parser';
import type { SourceCode } from '../types.js';
import { createRule } from '../utils/index.js';
import { getAttributeKeyText, getDirectiveName } from '../utils/ast-utils.js';
import { toRegExp } from '../utils/regexp.js';

type SortType = 'alphabetical' | 'natural' | 'line-length' | 'unsorted';
type SortOrder = 'asc' | 'desc';
type SpecialCharacters = 'keep' | 'remove';
type Modifier = 'shorthand' | 'multiline';
type Selector =
	| 'attribute'
	| 'shorthand-attribute'
	| 'style-directive'
	| 'special-directive'
	| 'attach-tag'
	| 'bind-directive'
	| 'on-directive'
	| 'class-directive'
	| 'use-directive'
	| 'transition-directive'
	| 'in-directive'
	| 'out-directive'
	| 'animate-directive'
	| 'let-directive'
	| 'ref-directive'
	| 'directive';

type FallbackSort = {
	type: Exclude<SortType, 'unsorted'>;
	order?: SortOrder;
};

type SharedSortOptions = {
	type?: SortType;
	order?: SortOrder;
	ignoreCase?: boolean;
	specialCharacters?: SpecialCharacters;
	locales?: string | string[];
	fallbackSort?: FallbackSort;
};

type GroupOption = string | ({ group: string } & SharedSortOptions);

type CustomGroupOption = {
	groupName: string;
	selector?: Selector | Selector[];
	modifiers?: Modifier[];
	elementNamePattern?: string;
	elementValuePattern?: string;
} & SharedSortOptions;

type UserOption = SharedSortOptions & {
	groups?: GroupOption[];
	customGroups?: CustomGroupOption[];
};

type Attr = AST.SvelteStartTag['attributes'][number];
type SortableAttr = Exclude<Attr, AST.SvelteSpreadAttribute>;

type ParsedGroupOption = {
	groupName: string;
	overrides: SharedSortOptions;
};

type ParsedCustomGroupOption = {
	groupName: string;
	selector?: Selector[];
	modifiers?: Modifier[];
	elementNamePattern?: ReturnType<typeof toRegExp>;
	elementValuePattern?: ReturnType<typeof toRegExp>;
	overrides: SharedSortOptions;
};

type ParsedOption = {
	globalSort: Required<
		Pick<SharedSortOptions, 'type' | 'order' | 'ignoreCase' | 'specialCharacters'>
	> &
		Pick<SharedSortOptions, 'locales' | 'fallbackSort'>;
	groups: ParsedGroupOption[];
	customGroups: ParsedCustomGroupOption[];
};

type SortableNode = {
	index: number;
	node: SortableAttr;
	keyText: string;
	selector: Selector;
	modifiers: Modifier[];
	valueText: string | null;
	size: number;
	groupName: string;
	groupIndex: number;
};

const ALL_MODIFIERS: readonly Modifier[] = ['shorthand', 'multiline'];

const DEFAULT_GROUPS: ParsedGroupOption[] = [
	{ groupName: 'class-directive', overrides: {} },
	{ groupName: 'style-directive', overrides: {} },
	{ groupName: 'bind-directive', overrides: {} },
	{ groupName: 'shorthand-attribute', overrides: {} },
	{ groupName: 'attribute', overrides: {} },
	{ groupName: 'unknown', overrides: {} },
	{ groupName: 'on-directive', overrides: {} },
	{ groupName: 'use-directive', overrides: {} },
	{ groupName: 'transition-directive', overrides: {} },
	{ groupName: 'in-directive', overrides: {} },
	{ groupName: 'out-directive', overrides: {} },
	{ groupName: 'animate-directive', overrides: {} },
	{ groupName: 'let-directive', overrides: {} },
	{ groupName: 'attach-tag', overrides: {} },
	{ groupName: 'special-directive', overrides: {} }
];

function parseOption(option: UserOption | undefined): ParsedOption {
	const groups = parseGroups(option?.groups);
	const customGroups = parseCustomGroups(option?.customGroups);
	return {
		globalSort: {
			type: option?.type ?? 'alphabetical',
			order: option?.order ?? 'asc',
			ignoreCase: option?.ignoreCase ?? true,
			specialCharacters: option?.specialCharacters ?? 'keep',
			locales: option?.locales,
			fallbackSort: option?.fallbackSort
		},
		groups,
		customGroups
	};
}

function parseGroups(groups: GroupOption[] | undefined): ParsedGroupOption[] {
	if (!groups?.length) {
		return DEFAULT_GROUPS;
	}
	return groups.map((group) => {
		if (typeof group === 'string') {
			return { groupName: group, overrides: {} };
		}
		const { group: groupName, ...overrides } = group;
		return { groupName, overrides };
	});
}

function parseCustomGroups(
	customGroups: CustomGroupOption[] | undefined
): ParsedCustomGroupOption[] {
	if (!customGroups?.length) {
		return [];
	}

	return customGroups.map((group) => ({
		groupName: group.groupName,
		selector: group.selector
			? Array.isArray(group.selector)
				? group.selector
				: [group.selector]
			: undefined,
		modifiers: group.modifiers,
		elementNamePattern: group.elementNamePattern ? toRegExp(group.elementNamePattern) : undefined,
		elementValuePattern: group.elementValuePattern
			? toRegExp(group.elementValuePattern)
			: undefined,
		overrides: {
			type: group.type,
			order: group.order,
			ignoreCase: group.ignoreCase,
			specialCharacters: group.specialCharacters,
			locales: group.locales,
			fallbackSort: group.fallbackSort
		}
	}));
}

function computePredefinedGroups(selector: Selector, modifiers: Modifier[]): string[] {
	const result: string[] = [selector];
	for (const modifier of ALL_MODIFIERS) {
		if (modifiers.includes(modifier)) {
			result.unshift(`${modifier}-${selector}`);
		}
	}
	if (modifiers.length === 2) {
		result.unshift(`${modifiers[0]}-${modifiers[1]}-${selector}`);
	}
	return result;
}

function normalizeText(text: string, option: SharedSortOptions): string {
	let normalized = text;
	if (option.specialCharacters === 'remove') {
		normalized = normalized.replace(/[^\p{L}\p{N}]+/gu, '');
	}
	if (option.ignoreCase) {
		normalized = normalized.toLowerCase();
	}
	return normalized;
}

function compareBySortOption(a: SortableNode, b: SortableNode, option: SharedSortOptions): number {
	const type = option.type ?? 'alphabetical';
	const order = option.order ?? 'asc';
	let result = 0;

	if (type === 'line-length') {
		result = a.size - b.size;
	} else if (type === 'natural') {
		const collator = new Intl.Collator(option.locales, {
			numeric: true,
			sensitivity: option.ignoreCase === false ? 'variant' : 'base'
		});
		result = collator.compare(normalizeText(a.keyText, option), normalizeText(b.keyText, option));
	} else if (type === 'alphabetical') {
		result = normalizeText(a.keyText, option).localeCompare(
			normalizeText(b.keyText, option),
			option.locales
		);
	}

	if (order === 'desc') {
		result = -result;
	}

	if (result === 0 && option.fallbackSort) {
		result = compareBySortOption(a, b, {
			...option,
			...option.fallbackSort,
			fallbackSort: undefined
		});
	}

	return result;
}

function getSelector(node: SortableAttr): Selector {
	switch (node.type) {
		case 'SvelteAttribute':
			return 'attribute';
		case 'SvelteShorthandAttribute':
			return 'shorthand-attribute';
		case 'SvelteStyleDirective':
			return 'style-directive';
		case 'SvelteSpecialDirective':
			return 'special-directive';
		case 'SvelteAttachTag':
			return 'attach-tag';
		case 'SvelteGenericsDirective':
			return 'directive';
		case 'SvelteDirective': {
			switch (getDirectiveName(node)) {
				case 'bind':
					return 'bind-directive';
				case 'on':
					return 'on-directive';
				case 'class':
					return 'class-directive';
				case 'use':
					return 'use-directive';
				case 'transition':
					return 'transition-directive';
				case 'in':
					return 'in-directive';
				case 'out':
					return 'out-directive';
				case 'animate':
					return 'animate-directive';
				case 'let':
					return 'let-directive';
				case 'ref':
					return 'ref-directive';
				default:
					return 'directive';
			}
		}
		default:
			return 'directive';
	}
}

function getModifiers(node: SortableAttr): Modifier[] {
	const modifiers: Modifier[] = [];
	if (node.type === 'SvelteShorthandAttribute') {
		modifiers.push('shorthand');
	}
	if (node.loc.start.line !== node.loc.end.line) {
		modifiers.push('multiline');
	}
	return modifiers;
}

function getValueText(node: SortableAttr, sourceCode: SourceCode): string | null {
	if (node.type === 'SvelteAttribute' || node.type === 'SvelteStyleDirective') {
		if (!node.value.length) {
			return null;
		}
		const first = node.value[0];
		const last = node.value[node.value.length - 1];
		return sourceCode.text.slice(first.range[0], last.range[1]);
	}
	if ('expression' in node && node.expression) {
		return sourceCode.getText(node.expression);
	}
	return null;
}

function resolveGroup(
	node: Omit<SortableNode, 'groupName' | 'groupIndex'>,
	option: ParsedOption,
	groupIndexMap: Map<string, number>
): { groupName: string; groupIndex: number } {
	for (const customGroup of option.customGroups) {
		if (customGroup.selector && !customGroup.selector.includes(node.selector)) {
			continue;
		}
		if (customGroup.modifiers && customGroup.modifiers.some((m) => !node.modifiers.includes(m))) {
			continue;
		}
		if (customGroup.elementNamePattern && !customGroup.elementNamePattern.test(node.keyText)) {
			continue;
		}
		if (
			customGroup.elementValuePattern &&
			(!node.valueText || !customGroup.elementValuePattern.test(node.valueText))
		) {
			continue;
		}
		return {
			groupName: customGroup.groupName,
			groupIndex: groupIndexMap.get(customGroup.groupName) ?? Number.MAX_SAFE_INTEGER
		};
	}

	for (const group of computePredefinedGroups(node.selector, node.modifiers)) {
		if (groupIndexMap.has(group)) {
			return { groupName: group, groupIndex: groupIndexMap.get(group)! };
		}
	}

	const unknownIndex = groupIndexMap.get('unknown') ?? Number.MAX_SAFE_INTEGER;
	return { groupName: 'unknown', groupIndex: unknownIndex };
}

function resolveSortOption(
	node: SortableNode,
	option: ParsedOption,
	groupOptionMap: Map<string, SharedSortOptions>
): SharedSortOptions {
	const groupOption = groupOptionMap.get(node.groupName) ?? {};
	const customGroup = option.customGroups.find((cg) => cg.groupName === node.groupName);
	return {
		...option.globalSort,
		...groupOption,
		...customGroup?.overrides
	};
}

export default createRule('sort-props', {
	meta: {
		docs: {
			description: 'enforce grouped order of props and directives',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					type: {
						enum: ['alphabetical', 'natural', 'line-length', 'unsorted']
					},
					order: {
						enum: ['asc', 'desc']
					},
					ignoreCase: { type: 'boolean' },
					specialCharacters: {
						enum: ['keep', 'remove']
					},
					locales: {
						anyOf: [
							{ type: 'string' },
							{
								type: 'array',
								items: { type: 'string' },
								minItems: 1,
								uniqueItems: true
							}
						]
					},
					fallbackSort: {
						type: 'object',
						properties: {
							type: {
								enum: ['alphabetical', 'natural', 'line-length']
							},
							order: {
								enum: ['asc', 'desc']
							}
						},
						required: ['type'],
						additionalProperties: false
					},
					groups: {
						type: 'array',
						items: {
							anyOf: [
								{ type: 'string' },
								{
									type: 'object',
									properties: {
										group: { type: 'string' },
										type: {
											enum: ['alphabetical', 'natural', 'line-length', 'unsorted']
										},
										order: {
											enum: ['asc', 'desc']
										},
										ignoreCase: { type: 'boolean' },
										specialCharacters: {
											enum: ['keep', 'remove']
										},
										locales: {
											anyOf: [
												{ type: 'string' },
												{
													type: 'array',
													items: { type: 'string' },
													minItems: 1,
													uniqueItems: true
												}
											]
										}
									},
									required: ['group'],
									additionalProperties: false
								}
							]
						},
						minItems: 1
					},
					customGroups: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								groupName: { type: 'string' },
								selector: {
									anyOf: [
										{
											enum: [
												'attribute',
												'shorthand-attribute',
												'style-directive',
												'special-directive',
												'attach-tag',
												'bind-directive',
												'on-directive',
												'class-directive',
												'use-directive',
												'transition-directive',
												'in-directive',
												'out-directive',
												'animate-directive',
												'let-directive',
												'ref-directive',
												'directive'
											]
										},
										{
											type: 'array',
											items: {
												enum: [
													'attribute',
													'shorthand-attribute',
													'style-directive',
													'special-directive',
													'attach-tag',
													'bind-directive',
													'on-directive',
													'class-directive',
													'use-directive',
													'transition-directive',
													'in-directive',
													'out-directive',
													'animate-directive',
													'let-directive',
													'ref-directive',
													'directive'
												]
											},
											minItems: 1,
											uniqueItems: true
										}
									]
								},
								modifiers: {
									type: 'array',
									items: { enum: ['shorthand', 'multiline'] },
									minItems: 1,
									uniqueItems: true
								},
								elementNamePattern: { type: 'string' },
								elementValuePattern: { type: 'string' },
								type: {
									enum: ['alphabetical', 'natural', 'line-length', 'unsorted']
								},
								order: {
									enum: ['asc', 'desc']
								},
								ignoreCase: { type: 'boolean' },
								specialCharacters: {
									enum: ['keep', 'remove']
								},
								locales: {
									anyOf: [
										{ type: 'string' },
										{
											type: 'array',
											items: { type: 'string' },
											minItems: 1,
											uniqueItems: true
										}
									]
								},
								fallbackSort: {
									type: 'object',
									properties: {
										type: {
											enum: ['alphabetical', 'natural', 'line-length']
										},
										order: {
											enum: ['asc', 'desc']
										}
									},
									required: ['type'],
									additionalProperties: false
								}
							},
							required: ['groupName'],
							additionalProperties: false
						},
						minItems: 1
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			shouldBefore: "'{{right}}' should go before '{{left}}'.",
			shouldGroupBefore:
				"'{{right}}' (group: {{rightGroup}}) should go before '{{left}}' (group: {{leftGroup}})."
		},
		type: 'layout',
		fixable: 'code'
	},
	create(context) {
		const option = parseOption(context.options[0]);
		const sourceCode = context.sourceCode;
		type FixFunction = NonNullable<Parameters<typeof context.report>[0]['fix']>;
		const groupIndexMap = new Map(option.groups.map((group, index) => [group.groupName, index]));
		const groupOptionMap = new Map(
			option.groups.map((group) => [group.groupName, group.overrides])
		);
		const keyCache = new Map<SortableAttr, string>();

		function getKey(node: SortableAttr): string {
			const cached = keyCache.get(node);
			if (cached != null) {
				return cached;
			}
			const key = getAttributeKeyText(node, context);
			keyCache.set(node, key);
			return key;
		}

		function compareNodes(a: SortableNode, b: SortableNode): number {
			if (a.groupIndex !== b.groupIndex) {
				return a.groupIndex - b.groupIndex;
			}
			const sortOption = resolveSortOption(a, option, groupOptionMap);
			return compareBySortOption(a, b, sortOption);
		}

		function report(current: SortableNode, previous: SortableNode, fixerCallback?: FixFunction) {
			context.report({
				node: current.node,
				messageId: current.groupName === previous.groupName ? 'shouldBefore' : 'shouldGroupBefore',
				data: {
					right: current.keyText,
					left: previous.keyText,
					rightGroup: current.groupName,
					leftGroup: previous.groupName
				},
				fix: fixerCallback
			});
		}

		return {
			SvelteStartTag(node) {
				const partitions: SortableAttr[][] = [[]];
				for (const attr of node.attributes) {
					if (attr.type === 'SvelteSpreadAttribute') {
						partitions.push([]);
						continue;
					}
					partitions[partitions.length - 1].push(attr);
				}

				for (const partition of partitions) {
					const sortableNodes: SortableNode[] = partition.map((attr) => {
						const keyText = getKey(attr);
						const selector = getSelector(attr);
						const modifiers = getModifiers(attr);
						const baseNode = {
							index: node.attributes.indexOf(attr),
							node: attr,
							keyText,
							selector,
							modifiers,
							valueText: getValueText(attr, sourceCode),
							size: sourceCode.getText(attr).length
						};
						const group = resolveGroup(baseNode, option, groupIndexMap);
						return { ...baseNode, ...group };
					});

					if (sortableNodes.length < 2) {
						continue;
					}

					const sortedNodes = [...sortableNodes].sort((a, b) => {
						const compared = compareNodes(a, b);
						return compared || a.index - b.index;
					});

					const hasDifferentOrder = sortedNodes.some(
						(node, index) => node !== sortableNodes[index]
					);

					const partitionFix: FixFunction | undefined = hasDifferentOrder
						? (fixer) => {
								const sortedTexts = sortedNodes.map((node) => sourceCode.getText(node.node));
								return sortableNodes.map((node, index) =>
									fixer.replaceText(node.node, sortedTexts[index])
								);
							}
						: undefined;

					let didAttachFix = false;

					for (let i = 1; i < sortableNodes.length; i++) {
						const current = sortableNodes[i];
						const invalidPrevious = sortableNodes
							.slice(0, i)
							.find((previous) => compareNodes(previous, current) > 0);
						if (invalidPrevious) {
							report(current, invalidPrevious, !didAttachFix ? partitionFix : undefined);
							didAttachFix = true;
						}
					}
				}
			}
		};
	}
});
