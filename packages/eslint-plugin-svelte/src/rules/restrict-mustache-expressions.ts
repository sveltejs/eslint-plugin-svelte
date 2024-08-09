import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import { TypeFlags } from 'typescript';
import { type TSESTree } from '@typescript-eslint/types';
import type { TS, TSTools } from '../utils/ts-utils';
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

		const config: Config = Object.assign(getDefaultOptions(), context.options[0] || {});

		function checkExpression(node: AST.SvelteMustacheTag) {
			const allowed_types: Set<string> = new Set(['string']);
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
			} else if (node.parent.type !== 'SvelteStyleDirective') {
				// we are rendering a text expression, so we only allow stringifiable types
				opts = config?.textExpressions
					? Object.assign(getDefaultOptions(), config.textExpressions)
					: config;
			} else {
				return;
			}
			console.log(getSourceCode(context).getText(node));
			console.log(node);

			const { allowBoolean, allowNull, allowUndefined, allowNumber } = opts;
			if (allowBoolean === true) allowed_types.add('boolean');
			if (allowNumber === true) allowed_types.add('number');
			if (allowNull) allowed_types.add('null');
			if (allowUndefined) allowed_types.add('undefined');

			const type = getNodeType(node.expression);
			if (type) {
				if (type_allowed(type, allowed_types, tools!)) {
					return;
				}
				context.report({
					node,
					messageId: 'expectedStringifyableType',
					data: {
						type: getTypeName(type, tools!),
						types: [...allowed_types].map((t) => `\`${t}\``).join(', ')
					}
				});
			}
		}

		return {
			SvelteMustacheTag: checkExpression
		};
	}
});

function type_allowed(type: TS.Type, allowed_types: Set<string>, tools: TSTools): boolean {
	if (type.flags & TypeFlags.StringLike) {
		return true;
	}
	if (type.flags & TypeFlags.BooleanLike) {
		return allowed_types.has('boolean');
	}
	if (type.flags & TypeFlags.NumberLike) {
		return allowed_types.has('number');
	}
	if (type.flags & TypeFlags.Null) {
		return allowed_types.has('null');
	}
	if (type.flags & TypeFlags.Undefined) {
		return allowed_types.has('undefined');
	}
	if (type.isUnion()) {
		for (const sub_type of type.types) {
			if (!type_allowed(sub_type, allowed_types, tools)) {
				return false;
			}
		}

		return true;
	}

	return false;
}
