import { createRule } from '../utils/index.js';
import { findAttribute, getLangValue } from '../utils/ast-utils.js';
import type { SvelteScriptElement, SvelteStyleElement } from 'svelte-eslint-parser/lib/ast';
import { getSourceCode } from '../utils/compat.js';

export default createRule('block-lang', {
	meta: {
		docs: {
			description:
				'disallows the use of languages other than those specified in the configuration for the lang attribute of `<script>` and `<style>` blocks.',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					enforceScriptPresent: {
						type: 'boolean'
					},
					enforceStylePresent: {
						type: 'boolean'
					},
					script: {
						oneOf: [
							{
								type: ['string', 'null']
							},
							{
								type: 'array',
								items: {
									type: ['string', 'null']
								},
								minItems: 1
							}
						]
					},
					style: {
						oneOf: [
							{
								type: ['string', 'null']
							},
							{
								type: 'array',
								items: {
									type: ['string', 'null']
								},
								minItems: 1
							}
						]
					}
				},
				additionalProperties: false
			}
		],
		messages: {},
		type: 'suggestion'
	},
	create(context) {
		if (!getSourceCode(context).parserServices.isSvelte) {
			return {};
		}
		const enforceScriptPresent: boolean = context.options[0]?.enforceScriptPresent ?? false;
		const enforceStylePresent: boolean = context.options[0]?.enforceStylePresent ?? false;

		const scriptOption: string | null | (string | null)[] = context.options[0]?.script ?? null;
		const allowedScriptLangs: (string | null)[] = Array.isArray(scriptOption)
			? scriptOption.filter((lang) => lang != null && lang !== '')
			: [scriptOption];
		const scriptNodes: SvelteScriptElement[] = [];

		const styleOption: string | null | (string | null)[] = context.options[0]?.style ?? null;
		const allowedStyleLangs: (string | null)[] = Array.isArray(styleOption)
			? styleOption
			: [styleOption];
		const styleNodes: SvelteStyleElement[] = [];

		return {
			SvelteScriptElement(node) {
				scriptNodes.push(node);
			},
			SvelteStyleElement(node) {
				styleNodes.push(node);
			},
			'Program:exit'() {
				if (scriptNodes.length === 0 && enforceScriptPresent) {
					context.report({
						loc: { line: 1, column: 1 },
						message: `The <script> block should be present and its lang attribute should be ${prettyPrintLangs(
							allowedScriptLangs
						)}.`,
						suggest: allowedScriptLangs
							.filter((lang) => lang != null && lang !== '')
							.map((lang) => {
								return {
									desc: `Add a <script> block with the lang attribute set to "${lang}".`,
									fix: (fixer) => {
										const langAttributeText = getLangAttributeText(lang ?? '', true);
										return fixer.insertTextAfterRange(
											[0, 0],
											`<script${langAttributeText}>\n</script>\n\n`
										);
									}
								};
							})
					});
				}
				for (const scriptNode of scriptNodes) {
					if (!allowedScriptLangs.includes(getLangValue(scriptNode)?.toLowerCase() ?? null)) {
						const langAttribute = findAttribute(scriptNode, 'lang');
						context.report({
							node: scriptNode,
							message: `The lang attribute of the <script> block should be ${prettyPrintLangs(
								allowedScriptLangs
							)}.`,
							suggest: allowedScriptLangs
								.filter((lang) => lang != null && lang !== '')
								.map((lang) => {
									const langAttributeText = getLangAttributeText(lang ?? '', true);
									if (langAttribute) {
										return {
											desc: `Add a <script> block with the lang attribute set to "${lang}".`,
											fix: (fixer) => {
												return fixer.replaceText(langAttribute, langAttributeText.trim());
											}
										};
									}
									return {
										desc: `Add a <script> block with the lang attribute set to "${lang}".`,
										fix: (fixer) => {
											return fixer.insertTextBeforeRange(
												[scriptNode.startTag.range[0] + 7, 0],
												langAttributeText
											);
										}
									};
								})
						});
					}
				}
				if (styleNodes.length === 0 && enforceStylePresent) {
					const sourceCode = getSourceCode(context);
					context.report({
						loc: { line: 1, column: 1 },
						message: `The <style> block should be present and its lang attribute should be ${prettyPrintLangs(
							allowedStyleLangs
						)}.`,
						suggest: allowedStyleLangs
							.filter((lang) => lang != null && lang !== '')
							.map((lang) => {
								return {
									desc: `Add a <style> block with the lang attribute set to "${lang}".`,
									fix: (fixer) => {
										const langAttributeText = getLangAttributeText(lang ?? '', true);
										return fixer.insertTextAfterRange(
											[sourceCode.text.length, sourceCode.text.length],
											`<style${langAttributeText}>\n</style>\n\n`
										);
									}
								};
							})
					});
				}
				for (const styleNode of styleNodes) {
					if (!allowedStyleLangs.includes(getLangValue(styleNode)?.toLowerCase() ?? null)) {
						const langAttribute = findAttribute(styleNode, 'lang');
						context.report({
							node: styleNode,
							message: `The lang attribute of the <style> block should be ${prettyPrintLangs(
								allowedStyleLangs
							)}.`,
							suggest: allowedStyleLangs
								.filter((lang) => lang != null && lang !== '')
								.map((lang) => {
									const langAttributeText = getLangAttributeText(lang ?? '', true);
									if (langAttribute) {
										return {
											desc: `Add a <style> block with the lang attribute set to "${lang}".`,
											fix: (fixer) => {
												return fixer.replaceText(langAttribute, langAttributeText.trim());
											}
										};
									}
									return {
										desc: `Add a <style> block with the lang attribute set to "${lang}".`,
										fix: (fixer) => {
											return fixer.insertTextBeforeRange(
												[styleNode.startTag.range[0] + 6, 0],
												langAttributeText
											);
										}
									};
								})
						});
					}
				}
			}
		};
	}
});

/**
 * Prints the list of allowed languages, with special handling of the `null` option.
 */
function prettyPrintLangs(langs: (string | null)[]): string {
	const hasNull = langs.includes(null);
	const nonNullLangs = langs.filter((lang) => lang !== null).map((lang) => `"${lang}"`);
	if (nonNullLangs.length === 0) {
		// No special behavior for `hasNull`, because that can never happen.
		return 'omitted';
	}
	const hasNullText = hasNull ? 'either omitted or ' : '';
	const nonNullText =
		nonNullLangs.length === 1 ? nonNullLangs[0] : `one of ${nonNullLangs.join(', ')}`;
	return hasNullText + nonNullText;
}

/**
 * Returns the lang attribute text, with special handling of the `null` lang option with respect to the `prependWhitespace` argument.
 */
function getLangAttributeText(lang: string, prependWhitespace: boolean): string {
	return `${prependWhitespace ? ' ' : ''}lang="${lang}"`;
}
