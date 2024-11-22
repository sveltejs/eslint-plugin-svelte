import { createRule } from '../utils';

export default createRule('consistent-selector-style', {
	meta: {
		docs: {
			description: 'enforce a consistent style for CSS selectors',
			category: 'Stylistic Issues',
			recommended: false
		},
		schema: [],
		messages: {},
		type: 'suggestion'
	},
	create(context) {
		return {};
	}
});
