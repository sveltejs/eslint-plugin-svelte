import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { getSourceCode } from '../utils/compat.js';
import { findVariable } from '../utils/ast-utils.js';
import type { RuleContext } from '../types.js';
import type { SvelteLiteral } from 'svelte-eslint-parser/lib/ast';

export default createRule('no-navigation-without-base', {
	meta: {
		docs: {
			description:
				'disallow using navigation (links, goto, pushState, replaceState) without the base path',
			category: 'SvelteKit',
			recommended: false
		},
		schema: [],
		messages: {
			gotoNotPrefixed: "Found a goto() call with a url that isn't prefixed with the base path.",
			linkNotPrefixed: "Found a link with a url that isn't prefixed with the base path.",
			pushStateNotPrefixed:
				"Found a pushState() call with a url that isn't prefixed with the base path.",
			replaceStateNotPrefixed:
				"Found a replaceState() call with a url that isn't prefixed with the base path."
		},
		type: 'suggestion'
	},
	create(context) {
		let basePathNames: Set<TSESTree.Identifier> = new Set<TSESTree.Identifier>();
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(
					getSourceCode(context).scopeManager.globalScope!
				);
				basePathNames = extractBasePathReferences(referenceTracker, context);
				const {
					goto: gotoCalls,
					pushState: pushStateCalls,
					replaceState: replaceStateCalls
				} = extractFunctionCallReferences(referenceTracker);
				for (const gotoCall of gotoCalls) {
					checkGotoCall(context, gotoCall, basePathNames);
				}
				for (const pushStateCall of pushStateCalls) {
					checkShallowNavigationCall(context, pushStateCall, basePathNames, 'pushStateNotPrefixed');
				}
				for (const replaceStateCall of replaceStateCalls) {
					checkShallowNavigationCall(
						context,
						replaceStateCall,
						basePathNames,
						'replaceStateNotPrefixed'
					);
				}
			},
			SvelteAttribute(node) {
				if (
					node.parent.parent.type !== 'SvelteElement' ||
					node.parent.parent.kind !== 'html' ||
					node.parent.parent.name.type !== 'SvelteName' ||
					node.parent.parent.name.name !== 'a' ||
					node.key.name !== 'href'
				) {
					return;
				}
				const hrefValue = node.value[0];
				if (hrefValue.type === 'SvelteLiteral') {
					if (!urlIsAbsolute(hrefValue)) {
						context.report({ loc: hrefValue.loc, messageId: 'linkNotPrefixed' });
					}
					return;
				}
				if (
					!urlStartsWithBase(hrefValue.expression, basePathNames) &&
					!urlIsAbsolute(hrefValue.expression)
				) {
					context.report({ loc: hrefValue.loc, messageId: 'linkNotPrefixed' });
				}
			}
		};
	}
});

// Extract all imports of the base path

function extractBasePathReferences(
	referenceTracker: ReferenceTracker,
	context: RuleContext
): Set<TSESTree.Identifier> {
	const set = new Set<TSESTree.Identifier>();
	for (const { node } of referenceTracker.iterateEsmReferences({
		'$app/paths': {
			[ReferenceTracker.ESM]: true,
			base: {
				[ReferenceTracker.READ]: true
			}
		}
	})) {
		const variable = findVariable(context, (node as TSESTree.ImportSpecifier).local);
		if (!variable) continue;
		for (const reference of variable.references) {
			if (reference.identifier.type === 'Identifier') set.add(reference.identifier);
		}
	}
	return set;
}

// Extract all references to goto, pushState and replaceState

function extractFunctionCallReferences(referenceTracker: ReferenceTracker): {
	goto: TSESTree.CallExpression[];
	pushState: TSESTree.CallExpression[];
	replaceState: TSESTree.CallExpression[];
} {
	const rawReferences = Array.from(
		referenceTracker.iterateEsmReferences({
			'$app/navigation': {
				[ReferenceTracker.ESM]: true,
				goto: {
					[ReferenceTracker.CALL]: true
				},
				pushState: {
					[ReferenceTracker.CALL]: true
				},
				replaceState: {
					[ReferenceTracker.CALL]: true
				}
			}
		})
	);
	return {
		goto: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'goto')
			.map(({ node }) => node),
		pushState: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'pushState')
			.map(({ node }) => node),
		replaceState: rawReferences
			.filter(({ path }) => path[path.length - 1] === 'replaceState')
			.map(({ node }) => node)
	};
}

// Actual function checking

function checkGotoCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	basePathNames: Set<TSESTree.Identifier>
): void {
	if (call.arguments.length < 1) {
		return;
	}
	const url = call.arguments[0];
	if (!urlStartsWithBase(url, basePathNames)) {
		context.report({ loc: url.loc, messageId: 'gotoNotPrefixed' });
	}
}

function checkShallowNavigationCall(
	context: RuleContext,
	call: TSESTree.CallExpression,
	basePathNames: Set<TSESTree.Identifier>,
	messageId: string
): void {
	if (call.arguments.length < 1) {
		return;
	}
	const url = call.arguments[0];
	if (!urlIsEmpty(url) && !urlStartsWithBase(url, basePathNames)) {
		context.report({ loc: url.loc, messageId });
	}
}

// Helper functions

function urlStartsWithBase(
	url: TSESTree.CallExpressionArgument,
	basePathNames: Set<TSESTree.Identifier>
): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionStartsWithBase(url, basePathNames);
		case 'TemplateLiteral':
			return templateLiteralStartsWithBase(url, basePathNames);
		default:
			return false;
	}
}

function binaryExpressionStartsWithBase(
	url: TSESTree.BinaryExpression,
	basePathNames: Set<TSESTree.Identifier>
): boolean {
	return url.left.type === 'Identifier' && basePathNames.has(url.left);
}

function templateLiteralStartsWithBase(
	url: TSESTree.TemplateLiteral,
	basePathNames: Set<TSESTree.Identifier>
): boolean {
	const startingIdentifier = extractLiteralStartingIdentifier(url);
	return startingIdentifier !== undefined && basePathNames.has(startingIdentifier);
}

function extractLiteralStartingIdentifier(
	templateLiteral: TSESTree.TemplateLiteral
): TSESTree.Identifier | undefined {
	const literalParts = [...templateLiteral.expressions, ...templateLiteral.quasis].sort((a, b) =>
		a.range[0] < b.range[0] ? -1 : 1
	);
	for (const part of literalParts) {
		if (part.type === 'TemplateElement' && part.value.raw === '') {
			// Skip empty quasi in the begining
			continue;
		}
		if (part.type === 'Identifier') {
			return part;
		}
		return undefined;
	}
	return undefined;
}

function urlIsEmpty(url: TSESTree.CallExpressionArgument): boolean {
	return (
		(url.type === 'Literal' && url.value === '') ||
		(url.type === 'TemplateLiteral' &&
			url.expressions.length === 0 &&
			url.quasis.length === 1 &&
			url.quasis[0].value.raw === '')
	);
}

function urlIsAbsolute(url: SvelteLiteral | TSESTree.Expression): boolean {
	switch (url.type) {
		case 'BinaryExpression':
			return binaryExpressionIsAbsolute(url);
		case 'Literal':
			return typeof url.value === 'string' && urlValueIsAbsolute(url.value);
		case 'SvelteLiteral':
			return urlValueIsAbsolute(url.value);
		case 'TemplateLiteral':
			return templateLiteralIsAbsolute(url);
		default:
			return false;
	}
}

function binaryExpressionIsAbsolute(url: TSESTree.BinaryExpression): boolean {
	return (
		(url.left.type !== 'PrivateIdentifier' && urlIsAbsolute(url.left)) || urlIsAbsolute(url.right)
	);
}

function templateLiteralIsAbsolute(url: TSESTree.TemplateLiteral): boolean {
	return (
		url.expressions.some(urlIsAbsolute) ||
		url.quasis.some((quasi) => urlValueIsAbsolute(quasi.value.raw))
	);
}

function urlValueIsAbsolute(url: string): boolean {
	return url.includes('://');
}
