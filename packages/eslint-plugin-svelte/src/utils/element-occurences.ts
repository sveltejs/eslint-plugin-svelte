import type { AST } from 'svelte-eslint-parser';

export enum ElementOccurenceCount {
	ZeroOrOne,
	One,
	ZeroToInf
}

function multiplyCounts(
	left: ElementOccurenceCount,
	right: ElementOccurenceCount
): ElementOccurenceCount {
	if (left === ElementOccurenceCount.One) {
		return right;
	}
	if (right === ElementOccurenceCount.One) {
		return left;
	}
	if (left === right) {
		return left;
	}
	return ElementOccurenceCount.ZeroToInf;
}

function childElementOccurenceCount(parent: AST.SvelteHTMLNode | null): ElementOccurenceCount {
	if (parent === null) {
		return ElementOccurenceCount.One;
	}
	if (
		[
			'SvelteIfBlock',
			'SvelteElseBlock',
			'SvelteAwaitBlock',
			'SvelteAwaitPendingBlock',
			'SvelteAwaitThenBlock',
			'SvelteAwaitCatchBlock'
		].includes(parent.type)
	) {
		return ElementOccurenceCount.ZeroOrOne;
	}
	if (
		['SvelteEachBlock', 'SvelteSnippetBlock'].includes(parent.type) ||
		(parent.type === 'SvelteElement' && parent.kind === 'component')
	) {
		return ElementOccurenceCount.ZeroToInf;
	}
	return ElementOccurenceCount.One;
}

export function elementOccurrenceCount(element: AST.SvelteHTMLNode): ElementOccurenceCount {
	const parentCount =
		element.parent !== null ? elementOccurrenceCount(element.parent) : ElementOccurenceCount.One;
	const parentChildCount = childElementOccurenceCount(element.parent);
	return multiplyCounts(parentCount, parentChildCount);
}
