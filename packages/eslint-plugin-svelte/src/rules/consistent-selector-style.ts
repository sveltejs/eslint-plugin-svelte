import type { AST } from 'svelte-eslint-parser';
import type { AnyNode } from 'postcss';
import type {
	ClassName as SelectorClass,
	Identifier as SelectorIdentifier,
	Node as SelectorNode,
	Tag as SelectorTag
} from 'postcss-selector-parser';
import { findClassesInAttribute } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';
import { createRule } from '../utils/index.js';
import type { RuleContext, SourceCode } from '../types.js';

interface RuleGlobals {
	checkGlobal: boolean;
	style: string[];
	classSelections: Map<string, AST.SvelteHTMLElement[]>;
	idSelections: Map<string, AST.SvelteHTMLElement[]>;
	typeSelections: Map<string, AST.SvelteHTMLElement[]>;
	context: RuleContext;
	parserServices: SourceCode['parserServices'];
}

export default createRule('consistent-selector-style', {
	meta: {
		docs: {
			description: 'enforce a consistent style for CSS selectors',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					checkGlobal: {
						type: 'boolean'
					},
					style: {
						type: 'array',
						items: {
							enum: ['class', 'id', 'type']
						},
						maxItems: 3,
						uniqueItems: true
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			classShouldBeId: 'Selector should select by ID instead of class',
			classShouldBeType: 'Selector should select by element type instead of class',
			idShouldBeClass: 'Selector should select by class instead of ID',
			idShouldBeType: 'Selector should select by element type instead of ID',
			typeShouldBeClass: 'Selector should select by class instead of element type',
			typeShouldBeId: 'Selector should select by ID instead of element type'
		},
		type: 'suggestion'
	},
	create(context) {
		const sourceCode = getSourceCode(context);
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}

		const checkGlobal = context.options[0]?.checkGlobal ?? false;
		const style = context.options[0]?.style ?? ['type', 'id', 'class'];

		const classSelections: Map<string, AST.SvelteHTMLElement[]> = new Map();
		const idSelections: Map<string, AST.SvelteHTMLElement[]> = new Map();
		const typeSelections: Map<string, AST.SvelteHTMLElement[]> = new Map();

		return {
			SvelteElement(node) {
				if (node.kind !== 'html') {
					return;
				}
				addToArrayMap(typeSelections, node.name.name, node);
				const classes = node.startTag.attributes.flatMap(findClassesInAttribute);
				for (const className of classes) {
					addToArrayMap(classSelections, className, node);
				}
				for (const attribute of node.startTag.attributes) {
					if (attribute.type !== 'SvelteAttribute' || attribute.key.name !== 'id') {
						continue;
					}
					for (const value of attribute.value) {
						if (value.type === 'SvelteLiteral') {
							addToArrayMap(idSelections, value.value, node);
						}
					}
				}
			},
			'Program:exit'() {
				const styleContext = sourceCode.parserServices.getStyleContext!();
				if (styleContext.status !== 'success') {
					return;
				}
				checkSelectorsInPostCSSNode(styleContext.sourceAst, {
					checkGlobal,
					style,
					classSelections,
					idSelections,
					typeSelections,
					context,
					parserServices: sourceCode.parserServices
				});
			}
		};
	}
});

/**
 * Helper function to add a value to a Map of arrays
 */
function addToArrayMap(
	map: Map<string, AST.SvelteHTMLElement[]>,
	key: string,
	value: AST.SvelteHTMLElement
): void {
	map.set(key, (map.get(key) ?? []).concat(value));
}

/**
 * Checks selectors in a given PostCSS node
 */
function checkSelectorsInPostCSSNode(node: AnyNode, ruleGlobals: RuleGlobals): void {
	if (node.type === 'rule') {
		checkSelector(ruleGlobals.parserServices.getStyleSelectorAST(node), ruleGlobals);
	}
	if (
		(node.type === 'root' ||
			(node.type === 'rule' && (node.selector !== ':global' || ruleGlobals.checkGlobal)) ||
			node.type === 'atrule') &&
		node.nodes !== undefined
	) {
		node.nodes.flatMap((node) => checkSelectorsInPostCSSNode(node, ruleGlobals));
	}
}

/**
 * Checks an individual selector
 */
function checkSelector(node: SelectorNode, ruleGlobals: RuleGlobals): void {
	if (node.type === 'class') {
		checkClassSelector(node, ruleGlobals);
	}
	if (node.type === 'id') {
		checkIdSelector(node, ruleGlobals);
	}
	if (node.type === 'tag') {
		checkTypeSelector(node, ruleGlobals);
	}
	if (
		(node.type === 'pseudo' && (node.value !== ':global' || ruleGlobals.checkGlobal)) ||
		node.type === 'root' ||
		node.type === 'selector'
	) {
		node.nodes.flatMap((node) => checkSelector(node, ruleGlobals));
	}
}

/**
 * Checks a class selector
 */
function checkClassSelector(node: SelectorClass, ruleGlobals: RuleGlobals): void {
	const selection = ruleGlobals.classSelections.get(node.value) ?? [];
	for (const styleValue of ruleGlobals.style) {
		if (styleValue === 'class') {
			return;
		}
		if (styleValue === 'id' && couldBeId(selection)) {
			ruleGlobals.context.report({
				messageId: 'classShouldBeId',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
		if (styleValue === 'type' && couldBeType(selection, ruleGlobals.typeSelections)) {
			ruleGlobals.context.report({
				messageId: 'classShouldBeType',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
	}
}

/**
 * Checks an ID selector
 */
function checkIdSelector(node: SelectorIdentifier, ruleGlobals: RuleGlobals): void {
	const selection = ruleGlobals.idSelections.get(node.value) ?? [];
	for (const styleValue of ruleGlobals.style) {
		if (styleValue === 'class') {
			ruleGlobals.context.report({
				messageId: 'idShouldBeClass',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
		if (styleValue === 'id') {
			return;
		}
		if (styleValue === 'type' && couldBeType(selection, ruleGlobals.typeSelections)) {
			ruleGlobals.context.report({
				messageId: 'idShouldBeType',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
	}
}

/**
 * Checks a type selector
 */
function checkTypeSelector(node: SelectorTag, ruleGlobals: RuleGlobals): void {
	const selection = ruleGlobals.typeSelections.get(node.value) ?? [];
	for (const styleValue of ruleGlobals.style) {
		if (styleValue === 'class') {
			ruleGlobals.context.report({
				messageId: 'typeShouldBeClass',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
		if (styleValue === 'id' && couldBeId(selection)) {
			ruleGlobals.context.report({
				messageId: 'typeShouldBeId',
				loc: ruleGlobals.parserServices.styleSelectorNodeLoc(node) as AST.SourceLocation
			});
			return;
		}
		if (styleValue === 'type') {
			return;
		}
	}
}

/**
 * Checks whether a given selection could be obtained using an ID selector
 */
function couldBeId(selection: AST.SvelteHTMLElement[]): boolean {
	return selection.length <= 1;
}

/**
 * Checks whether a given selection could be obtained using a type selector
 */
function couldBeType(
	selection: AST.SvelteHTMLElement[],
	typeSelections: Map<string, AST.SvelteHTMLElement[]>
): boolean {
	const types = new Set(selection.map((node) => node.name.name));
	if (types.size > 1) {
		return false;
	}
	if (types.size < 1) {
		return true;
	}
	const type = [...types][0];
	const typeSelection = typeSelections.get(type);
	return typeSelection !== undefined && arrayEquals(typeSelection, selection);
}

/**
 * Compares two arrays for item equality
 */
function arrayEquals(array1: AST.SvelteHTMLElement[], array2: AST.SvelteHTMLElement[]): boolean {
	function comparator(a: AST.SvelteHTMLElement, b: AST.SvelteHTMLElement): number {
		return a.range[0] - b.range[0];
	}

	const array2Sorted = array2.slice().sort(comparator);
	return (
		array1.length === array2.length &&
		array1
			.slice()
			.sort(comparator)
			.every(function (value, index) {
				return value === array2Sorted[index];
			})
	);
}