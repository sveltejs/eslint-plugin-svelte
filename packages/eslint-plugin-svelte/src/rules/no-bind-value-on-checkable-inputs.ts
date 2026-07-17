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
				function getType(inputType: 'checkbox' | 'radio'): boolean {
					return Boolean(
						node.startTag?.attributes.some(
							(attr) =>
								attr.type === 'SvelteAttribute' &&
								attr.key.name === 'type' &&
								attr.value?.length === 1 &&
								((attr.value[0].type === 'SvelteLiteral' &&
									attr.value[0].value.toLowerCase() === inputType) || // type="checkbox"
									(attr.value[0].type === 'SvelteMustacheTag' &&
										attr.value[0].kind === 'text' &&
										attr.value[0].expression.type === 'Literal' &&
										typeof attr.value[0].expression.value === 'string' &&
										attr.value[0].expression.value.toLowerCase() === inputType)) // type={"checkbox"}
						)
					);
				}

				const isCheckbox = getType('checkbox');
				const isRadio = getType('radio');

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
