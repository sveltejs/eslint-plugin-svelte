import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { equalTokens } from '../utils/ast-utils.js';
import { getSvelteVersion } from '../utils/svelte-context.js';

type LengthCheck = {
	/** The expression whose `length` is checked. e.g. `items` in `items.length > 0` */
	object: TSESTree.Expression;
	/** Whether the condition is true when `object` is not empty. */
	nonEmpty: boolean;
	/** Whether `length` is read through optional chaining. e.g. `items?.length` */
	optional: boolean;
	/**
	 * Whether the condition gives the same result for an `undefined` length as for an empty `object`.
	 * e.g. `items?.length > 0` does, but `items?.length !== 0` does not.
	 */
	nullishSafe: boolean;
};

const NON_EMPTY_COMPARISONS: Partial<Record<TSESTree.BinaryExpression['operator'], number>> = {
	'>': 0,
	'>=': 1,
	'!==': 0,
	'!=': 0
};
const EMPTY_COMPARISONS: Partial<Record<TSESTree.BinaryExpression['operator'], number>> = {
	'===': 0,
	'==': 0,
	'<': 1,
	'<=': 0
};
const FLIPPED_OPERATORS: Partial<
	Record<TSESTree.BinaryExpression['operator'], TSESTree.BinaryExpression['operator']>
> = {
	'>': '<',
	'>=': '<=',
	'<': '>',
	'<=': '>=',
	'===': '===',
	'==': '==',
	'!==': '!==',
	'!=': '!='
};

/**
 * Get the object of the given `length` property access.
 * e.g. `items` for `items.length` and `items?.length`
 */
function getLengthObject(
	node: TSESTree.Node
): { object: TSESTree.Expression; optional: boolean } | null {
	let optional = false;
	let target = node;
	if (target.type === 'ChainExpression') {
		optional = true;
		target = target.expression;
	}
	if (
		target.type !== 'MemberExpression' ||
		target.computed ||
		target.property.type !== 'Identifier' ||
		target.property.name !== 'length'
	) {
		return null;
	}
	return { object: target.object, optional };
}

/**
 * Get the length check of the given condition.
 * e.g. `items.length`, `!items.length`, `items.length > 0` and `items.length === 0`
 */
function getLengthCheck(node: TSESTree.Expression): LengthCheck | null {
	if (node.type === 'UnaryExpression' && node.operator === '!') {
		const check = getLengthCheck(node.argument);
		return check && { ...check, nonEmpty: !check.nonEmpty };
	}
	if (node.type === 'BinaryExpression') {
		// Normalize `0 < items.length` to `items.length > 0`.
		const left = getLengthObject(node.left);
		const length = left ?? getLengthObject(node.right);
		const other = left ? node.right : node.left;
		const operator = left ? node.operator : FLIPPED_OPERATORS[node.operator];
		if (!length || !operator || other.type !== 'Literal' || typeof other.value !== 'number') {
			return null;
		}
		if (NON_EMPTY_COMPARISONS[operator] === other.value) {
			// `undefined > 0` and `undefined >= 1` are false, the same as for an empty array.
			const nullishSafe = operator === '>' || operator === '>=';
			return { ...length, nonEmpty: true, nullishSafe };
		}
		if (EMPTY_COMPARISONS[operator] === other.value) {
			return { ...length, nonEmpty: false, nullishSafe: false };
		}
		return null;
	}
	const length = getLengthObject(node);
	return length && { ...length, nonEmpty: true, nullishSafe: true };
}

/**
 * Get the `{#each}` block if it is the only non-whitespace child.
 */
function getOnlyEachBlock(
	children: AST.SvelteElseBlockAlone['children']
): AST.SvelteEachBlock | null {
	let eachBlock: AST.SvelteEachBlock | null = null;
	for (const child of children) {
		if (child.type === 'SvelteText' && !child.value.trim()) {
			continue;
		}
		if (child.type !== 'SvelteEachBlock' || eachBlock) {
			return null;
		}
		eachBlock = child;
	}
	return eachBlock;
}

export default createRule('prefer-each-else', {
	meta: {
		docs: {
			description:
				'require `{:else}` blocks in `{#each}` blocks instead of checking the length in `{#if}` blocks',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [],
		messages: {
			unexpected:
				'Use an `{:else}` block in the `{#each}` block instead of checking its length in an `{#if}` block.'
		},
		type: 'suggestion'
	},
	create(context) {
		const sourceCode = context.sourceCode;
		// Svelte 5 treats a nullish value in `{#each}` as an empty array,
		// while older versions throw an error.
		const allowsNullishEach = getSvelteVersion() === '5';

		return {
			SvelteIfBlock(node) {
				if (!node.else || node.else.elseif) {
					return;
				}
				const check = getLengthCheck(node.expression);
				if (!check || (check.optional && !(check.nullishSafe && allowsNullishEach))) {
					return;
				}
				const eachBlock = getOnlyEachBlock(check.nonEmpty ? node.children : node.else.children);
				if (!eachBlock || eachBlock.else) {
					return;
				}
				if (!equalTokens(check.object, eachBlock.expression, sourceCode)) {
					return;
				}
				context.report({
					node: node.expression,
					messageId: 'unexpected'
				});
			}
		};
	}
});
