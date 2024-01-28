import { createRule } from '../utils';
import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { getSourceCode } from '../utils/compat';

export default createRule('no-goto-without-base', {
	meta: {
		docs: {
			description: 'disallow using goto() without the base path',
			category: 'SvelteKit',
			recommended: false
		},
		schema: [],
		messages: {
			isNotPrefixedWithBasePath:
				"Found a goto() call with a url that isn't prefixed with the base path."
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(
					getSourceCode(context).scopeManager.globalScope!
				);
				const basePathNames = extractBasePathNames(referenceTracker);
				for (const gotoCall of extractGotoReferences(referenceTracker)) {
					if (gotoCall.arguments.length < 1) {
						continue;
					}
					const path = gotoCall.arguments[0];
					if (path.type === 'BinaryExpression') {
						if (path.left.type === 'Identifier' && basePathNames.includes(path.left.name)) {
							// The URL is in the form `base + "/foo"`, which is OK
							continue;
						}
						context.report({ loc: path.loc, messageId: 'isNotPrefixedWithBasePath' });
						continue;
					}
					if (path.type === 'TemplateLiteral') {
						continue;
						// TODO Parse literals begining with base
					}
					if (path.type === 'Literal') {
						const absolutePathRegex = /^(?:[+a-z]+:)?\/\//i;
						if (absolutePathRegex.test(path.value)) {
							// The URL is absolute, which is OK
							continue;
						}
						context.report({ loc: path.loc, messageId: 'isNotPrefixedWithBasePath' });
						continue;
					}
					context.report({ loc: path.loc, messageId: 'isNotPrefixedWithBasePath' });
				}
			}
		};
	}
});

// TODO: Return type
function extractGotoReferences(referenceTracker: ReferenceTracker) {
	return Array.from(
		referenceTracker.iterateEsmReferences({
			'$app/navigation': {
				[ReferenceTracker.ESM]: true,
				goto: {
					[ReferenceTracker.CALL]: true
				}
			}
		}),
		({ node }) => node
	);
}

function extractBasePathNames(referenceTracker: ReferenceTracker): string[] {
	return Array.from(
		referenceTracker.iterateEsmReferences({
			'$app/paths': {
				[ReferenceTracker.ESM]: true,
				base: {
					[ReferenceTracker.READ]: true
				}
			}
		}),
		({ node }) => node.local.name
	);
}
