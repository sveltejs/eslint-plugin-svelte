import { createRule } from '../utils/index.js';

export default createRule('valid-style-parse', {
	meta: {
		docs: {
			description: 'require valid style element parsing',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {},
		type: 'problem'
	},
	create(context) {
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const cwd = `${context.cwd ?? process.cwd()}/`;

		return {
			SvelteStyleElement(node) {
				const styleContext = sourceCode.parserServices.getStyleContext!();
				if (styleContext.status === 'parse-error') {
					context.report({
						loc: node.loc,
						message: `Error parsing style element. Error message: "${styleContext.error.message.replace(cwd, '')}"`
					});
				}
				if (styleContext.status === 'unknown-lang') {
					context.report({
						loc: node.loc,
						message: `Found unsupported style element language "${styleContext.sourceLang}"`
					});
				}
			}
		};
	}
});
