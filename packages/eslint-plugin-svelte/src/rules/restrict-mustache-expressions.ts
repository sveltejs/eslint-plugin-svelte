import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import { TypeFlags } from 'typescript';
import { type TSESTree } from '@typescript-eslint/types';
import type { TS } from '../utils/ts-utils';
import { getConstrainedTypeAtLocation, getTypeName, getTypeScriptTools } from '../utils/ts-utils';
import { getSourceCode } from '../utils/compat';

const props = {
	allowBoolean: {
		type: 'boolean'
	},
	allowNull: {
		type: 'boolean'
	},
	allowUndefined: {
		type: 'boolean'
	},
	allowNumber: {
		type: 'boolean'
	}
};

function getDefaultOptions() {
	return {
		allowBoolean: true,
		allowNumber: true,
		allowNull: false,
		allowUndefined: false
	};
}

type Props = {
	allowBoolean: boolean;
	allowNumber: boolean;
	allowNull: boolean;
	allowUndefined: boolean;
};

type Config = {
	stringTemplateExpressions?: Props;
	textExpressions?: Props;
} & Props;

export default createRule('restrict-mustache-expressions', {
	meta: {
		docs: {
			description: 'disallow non-string values in string contexts',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					...props,
					textExpressions: {
						...props
					},
					stringTemplateExpressions: {
						...props
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			expectedStringifyableType:
				'Expected {{type}} to be one of the following: {{types}}. You must cast or convert the expression to one of the allowed types.'
		},
		type: 'problem'
	},
	create(context) {
		const tools = getTypeScriptTools(context);
		if (!tools) {
			return {};
		}

		const { service } = tools;
		const checker = service.program.getTypeChecker();

		function getNodeType(
			node: TSESTree.Expression | TSESTree.PrivateIdentifier | TSESTree.SpreadElement
		): TS.Type | undefined {
			const tsNode = service.esTreeNodeToTSNodeMap.get(node);
			return tsNode && getConstrainedTypeAtLocation(checker, tsNode);
		}

		const config: Config = context.options[0] || getDefaultOptions();

		function checkExpression(node: AST.SvelteMustacheTag) {
			const allowed_types: string[] = ['string'];
			let opts: Props;
			if (node.parent.type === 'SvelteAttribute') {
				if (!node.parent.value.find((n) => n.type === 'SvelteLiteral')) {
					// we are rendering a non-literal attribute (eg: class:disabled={disabled}, so we allow any type
					return;
				}
				// we are rendering an template string attribute (eg: href="/page/{page.id}"), so we only allow stringifiable types
				opts = config?.stringTemplateExpressions
					? Object.assign(getDefaultOptions(), config.stringTemplateExpressions)
					: config;
			} else {
				// we are rendering a text expression, so we only allow stringifiable types
				opts = config?.textExpressions
					? Object.assign(getDefaultOptions(), config.textExpressions)
					: config;
			}

			const { allowBoolean, allowNull, allowUndefined, allowNumber } = opts;
			if (allowBoolean === true) allowed_types.push('boolean');
			if (allowNumber === true) allowed_types.push('number');
			if (allowNull) allowed_types.push('null');
			if (allowUndefined) allowed_types.push('undefined');

			// const sourceCode = getSourceCode(context);
			// console.log(node.parent);
			// console.log(sourceCode.getText(node));

			const type = getNodeType(node.expression);

			if (type) {
				if (type.flags & TypeFlags.StringLike) {
					return;
				}
				if (type.flags & TypeFlags.BooleanLike && allowBoolean) {
					return;
				}
				if (type.flags & TypeFlags.NumberLike && allowNumber) {
					return;
				}
				if (type.flags & TypeFlags.Null && allowNull) {
					return;
				}
				if (type.flags & TypeFlags.Undefined && allowUndefined) {
					return;
				}
				context.report({
					node,
					messageId: 'expectedStringifyableType',
					data: {
						type: getTypeName(type, tools!),
						types: allowed_types.map((t) => `\`${t}\``).join(', ')
					}
				});
			}
		}

		return {
			SvelteMustacheTag: checkExpression
		};
	}
});
