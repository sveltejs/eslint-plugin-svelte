import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';
import type { SourceCode } from '../types.js';

type ExpectedNode = AST.SvelteStartTag | AST.SvelteEndTag;
type OptionValue = 'always' | 'never';
type RuleOptions = {
	singleline: OptionValue;
	multiline: OptionValue;
	selfClosingTag?: Omit<RuleOptions, 'selfClosingTag'>;
};

function getPhrase(lineBreaks: number) {
	switch (lineBreaks) {
		case 0: {
			return 'no line breaks';
		}
		case 1: {
			return '1 line break';
		}
		default: {
			return `${lineBreaks} line breaks`;
		}
	}
}

function getExpectedLineBreaks(
	node: ExpectedNode,
	options: RuleOptions,
	type: keyof Omit<RuleOptions, 'selfClosingTag'>
) {
	const isSelfClosingTag = node.type === 'SvelteStartTag' && node.selfClosing;
	if (isSelfClosingTag && options.selfClosingTag && options.selfClosingTag[type]) {
		return options.selfClosingTag[type] === 'always' ? 1 : 0;
	}

	return options[type] === 'always' ? 1 : 0;
}

type NodeData = {
	actualLineBreaks: number;
	expectedLineBreaks: number;
	startToken: AST.Token;
	endToken: AST.Token;
};

function getSelfClosingData(
	sourceCode: SourceCode,
	node: AST.SvelteStartTag,
	options: RuleOptions
): NodeData | null {
	const tokens = sourceCode.getTokens(node);
	const closingToken = tokens[tokens.length - 2];
	if (closingToken.value !== '/') {
		return null;
	}

	const prevToken = sourceCode.getTokenBefore(closingToken)!;
	const type = node.loc.start.line === prevToken.loc.end.line ? 'singleline' : 'multiline';

	const expectedLineBreaks = getExpectedLineBreaks(node, options, type);
	const actualLineBreaks = closingToken.loc.start.line - prevToken.loc.end.line;

	return { actualLineBreaks, expectedLineBreaks, startToken: prevToken, endToken: closingToken };
}

function getNodeData(
	sourceCode: SourceCode,
	node: ExpectedNode,
	options: RuleOptions
): NodeData | null {
	const closingToken = sourceCode.getLastToken(node);
	if (closingToken.value !== '>') {
		return null;
	}

	const prevToken = sourceCode.getTokenBefore(closingToken)!;
	const type = node.loc.start.line === prevToken.loc.end.line ? 'singleline' : 'multiline';

	const expectedLineBreaks = getExpectedLineBreaks(node, options, type);
	const actualLineBreaks = closingToken.loc.start.line - prevToken.loc.end.line;

	return { actualLineBreaks, expectedLineBreaks, startToken: prevToken, endToken: closingToken };
}

export default createRule('html-closing-bracket-new-line', {
	meta: {
		docs: {
			description: "Require or disallow a line break before tag's closing brackets",
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					singleline: { enum: ['always', 'never'] },
					multiline: { enum: ['always', 'never'] },
					selfClosingTag: {
						type: 'object',
						properties: {
							singleline: { enum: ['always', 'never'] },
							multiline: { enum: ['always', 'never'] }
						},
						additionalProperties: false,
						minProperties: 1
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			expectedBeforeClosingBracket:
				'Expected {{expected}} before closing bracket, but {{actual}} found.'
		},
		fixable: 'code',
		type: 'suggestion'
	},
	create(context) {
		const options: RuleOptions = { ...(context.options[0] ?? {}) };
		options.singleline ??= 'never';
		options.multiline ??= 'always';

		const sourceCode = getSourceCode(context);

		return {
			'SvelteStartTag, SvelteEndTag'(node: ExpectedNode) {
				const data =
					node.type === 'SvelteStartTag' && node.selfClosing
						? getSelfClosingData(sourceCode, node, options)
						: getNodeData(sourceCode, node, options);
				if (!data) {
					return;
				}

				const { actualLineBreaks, expectedLineBreaks, startToken, endToken } = data;
				if (actualLineBreaks !== expectedLineBreaks) {
					// For SvelteEndTag, does not make sense to add a line break, so we only fix if there are extra line breaks
					if (node.type === 'SvelteEndTag' && expectedLineBreaks !== 0) {
						return;
					}

					context.report({
						node,
						loc: { start: startToken.loc.end, end: endToken.loc.start },
						messageId: 'expectedBeforeClosingBracket',
						data: {
							expected: getPhrase(expectedLineBreaks),
							actual: getPhrase(actualLineBreaks)
						},
						fix(fixer) {
							const range: AST.Range = [startToken.range[1], endToken.range[0]];
							const text = '\n'.repeat(expectedLineBreaks);
							return fixer.replaceTextRange(range, text);
						}
					});
				}
			}
		};
	}
});
