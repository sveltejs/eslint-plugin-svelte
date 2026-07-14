import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

export default createRule('no-checkbox-bind-value', {
	meta: {
		fixable: 'code',
		docs: {
			description: 'disallow useless `bind:value` on `<input type="checkbox">`',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {},
				additionalProperties: false
			}
		],
		type: 'problem',
		messages: {
			bindValue: '`bind:value` does not work on checkbox inputs. Did you mean `bind:checked`?'
		}
	},
	create(context) {
		return {
			"SvelteElement[name.name='input']"(node: AST.SvelteHTMLElement) {
				const isCheckbox = node.startTag?.attributes.some(
					(attr) =>
						attr.type === 'SvelteAttribute' &&
						attr.key.name === 'type' &&
						attr.value?.length === 1 &&
						((attr.value[0].type === 'SvelteLiteral' &&
							attr.value[0].value.toLowerCase() === 'checkbox') || // type="checkbox"
							(attr.value[0].type === 'SvelteMustacheTag' &&
								attr.value[0].kind === 'text' &&
								attr.value[0].expression.type === 'Literal' &&
								typeof attr.value[0].expression.value === 'string' &&
								attr.value[0].expression.value.toLowerCase() === 'checkbox')) // type={"checkbox"}
				);
				const bindValue = node.startTag?.attributes.find(
					(attr): attr is AST.SvelteBindingDirective =>
						attr.type === 'SvelteDirective' &&
						attr.kind === 'Binding' &&
						attr.key.name.name === 'value'
				);
				if (isCheckbox && bindValue) {
					context.report({
						node: bindValue,
						messageId: 'bindValue',
						fix(fixer) {
							if (bindValue.shorthand) return fixer.replaceText(bindValue, 'bind:checked={value}');
							return fixer.replaceText(bindValue.key, 'bind:checked');
						}
					});
				}
			}
		};
	}
});
