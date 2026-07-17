import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

export default createRule('no-bind-value-on-checkable-inputs', {
	meta: {
		fixable: 'code',
		docs: {
			description:
				'disallow useless `bind:value` on `<input type="checkbox">` and `<input type="radio">`',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		type: 'problem',
		messages: {
			checkbox:
				'`bind:value` does not work on checkbox inputs. Did you mean `bind:checked` or `bind:group`?',
			radio: '`bind:value` does not work on radio inputs. Did you mean `bind:group`?' // svelte compiler disallows `bind:checked` on radios
		}
	},
	create(context) {
		return {
			"SvelteElement[name.name='input']"(node: AST.SvelteHTMLElement) {
				function getType(): string | null {
					const typeAttr = node.startTag?.attributes.find(
						(attr): attr is AST.SvelteAttribute =>
							attr.type === 'SvelteAttribute' && attr.key.name === 'type'
					);
					if (!typeAttr) return null;
					if (typeAttr.value.length !== 1) return null;
					const typeValue = typeAttr.value[0];
					if (typeValue.type === 'SvelteLiteral') {
						// <input type="checkbox" />
						return typeValue.value.toLowerCase();
					}
					if (typeValue.type === 'SvelteMustacheTag') {
						const staticValue = getStaticValue(
							typeValue.expression,
							getScope(context, typeValue.expression)
						);
						if (typeof staticValue?.value !== 'string') return null
						 // <input type={"checkbox"} />;
						return staticValue.value.toLowerCase()
					}
					return null;
				}

				const type = getType();
				if (!type) return;
				const isCheckbox = type === 'checkbox';
				const isRadio = type === 'radio';

				const bindValue = node.startTag?.attributes.find(
					(attr): attr is AST.SvelteBindingDirective =>
						attr.type === 'SvelteDirective' &&
						attr.kind === 'Binding' &&
						attr.key.name.name === 'value'
				);

				if (bindValue && (isCheckbox || isRadio)) {
					context.report({
						node: bindValue,
						messageId: isCheckbox ? 'checkbox' : 'radio',
						fix(fixer) {
							if (isCheckbox) {
								if (bindValue.shorthand)
									return fixer.replaceText(bindValue, 'bind:checked={value}');
								return fixer.replaceText(bindValue.key, 'bind:checked');
							}
							return null;
						}
					});
				}
			}
		};
	}
});
