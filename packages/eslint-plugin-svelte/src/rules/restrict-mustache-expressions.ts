import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import { TypeFlags } from 'typescript';
import type { TSESTree } from '@typescript-eslint/types';
import type { TS, TSTools } from '../utils/ts-utils';
import { getTypeName, getTypeScriptTools } from '../utils/ts-utils';
import { findVariable } from '../utils/ast-utils';
import type { RuleContext } from '../types';

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

enum NodeType {
	Unknown,
	Allowed
}

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
				'Expected `{{disallowed}}` to be one of the following: {{types}}. You must cast or convert the expression to one of the allowed types.'
		},
		type: 'problem'
	},
	create(context) {
		const tools = getTypeScriptTools(context);
		if (!tools) {
			return {};
		}

		const config: Config = Object.assign(getDefaultOptions(), context.options[0] || {});

		function checkMustacheExpression(node: AST.SvelteMustacheTag) {
			const allowed_types: Set<string> = new Set(['string']);
			let opts: Props;
			if (node.kind === 'raw') return;
			if (node.parent.type === 'SvelteAttribute') {
				if (!node.parent.value.find((n) => n.type === 'SvelteLiteral')) {
					// we are rendering a non-literal attribute (eg: class:disabled={disabled}, so we allow any type
					// (todo): maybe we could maybe check the expected type of the attribute here, but I think the language server already does that?
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

			const { allowBoolean, allowNull, allowUndefined, allowNumber } = opts;
			if (allowBoolean === true) allowed_types.add('boolean');
			if (allowNumber === true) allowed_types.add('number');
			if (allowNull) allowed_types.add('null');
			if (allowUndefined) allowed_types.add('undefined');

			const type = disallowed_expression(node.expression, allowed_types, context, tools!);
			if (NodeType.Allowed === type) return;
			context.report({
				node,
				messageId: 'expectedStringifyableType',
				data: {
					disallowed: type === NodeType.Unknown ? 'unknown' : getTypeName(type, tools!),
					types: [...allowed_types].map((t) => `\`${t}\``).join(', ')
				}
			});
		}

		return {
			SvelteMustacheTag: checkMustacheExpression
		};
	}
});

function getNodeType(node: TSESTree.Node, tools: TSTools): TS.Type | NodeType.Unknown {
	const checker = tools.service.program.getTypeChecker();
	const ts_node = tools.service.esTreeNodeToTSNodeMap.get(node);
	if (!ts_node) return NodeType.Unknown;
	const nodeType = checker.getTypeAtLocation(ts_node);
	const constrained = checker.getBaseConstraintOfType(nodeType);
	return constrained ?? nodeType;
}

function disallowed_identifier(
	expression: TSESTree.Identifier,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	const type = get_variable_type(expression, context, tools);

	if (type === NodeType.Unknown) return NodeType.Unknown;

	return disallowed_type(type, allowed_types, context, tools);
}

function get_variable_type(
	identifier: TSESTree.Identifier,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType.Unknown {
	const variable = findVariable(context, identifier);

	const identifiers = variable?.identifiers[0];

	if (!identifiers) return getNodeType(identifier, tools);

	const type = getNodeType(variable.identifiers[0], tools);

	if (NodeType.Unknown === type) return NodeType.Unknown;

	return narrow_variable_type(identifier, type, tools);
}

function narrow_variable_type(
	identifier: TSESTree.Identifier,
	type: TS.Type,
	tools: TSTools
): TS.Type {
	const checker = tools.service.program.getTypeChecker();
	let currentNode: TSESTree.Node | AST.SvelteNode | undefined = identifier as TSESTree.Node;

	while (currentNode) {
		if (currentNode.type === 'SvelteIfBlock') {
			const condition = currentNode.expression;
			if (condition.type === 'Identifier' && condition.name === identifier.name) {
				return checker.getNonNullableType(type);
			}
		}
		currentNode = currentNode.parent as TSESTree.Node | AST.SvelteNode;
	}

	return type;
}

function disallowed_type(
	type: TS.Type,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	if (type.flags & TypeFlags.StringLike) {
		return NodeType.Allowed;
	}
	if (type.flags & TypeFlags.BooleanLike) {
		return allowed_types.has('boolean') ? NodeType.Allowed : type;
	}
	if (type.flags & TypeFlags.NumberLike) {
		return allowed_types.has('number') ? NodeType.Allowed : type;
	}
	if (type.flags & TypeFlags.Null) {
		return allowed_types.has('null') ? NodeType.Allowed : type;
	}
	if (type.flags & TypeFlags.Undefined) {
		return allowed_types.has('undefined') ? NodeType.Allowed : type;
	}
	if (type.isUnion()) {
		for (const sub_type of type.types) {
			const disallowed = disallowed_type(sub_type, allowed_types, context, tools);
			if (disallowed) {
				return disallowed;
			}
		}
		return NodeType.Allowed;
	}

	return type;
}

function disallowed_literal(
	expression: TSESTree.Literal,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	const type = getNodeType(expression, tools);

	if (NodeType.Unknown === type) return NodeType.Unknown;

	return disallowed_type(type, allowed_types, context, tools);
}

function disallowed_expression(
	expression: TSESTree.Expression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	switch (expression.type) {
		case 'Literal':
			return disallowed_literal(expression, allowed_types, context, tools);
		case 'Identifier':
			return disallowed_identifier(expression, allowed_types, context, tools);
		case 'ArrayExpression':
			return getNodeType(expression, tools);
		case 'MemberExpression':
			return disallowed_member_expression(expression, allowed_types, context, tools);
		case 'LogicalExpression':
			return disallowed_logical_expression(expression, allowed_types, context, tools);
		default: {
			const type = getNodeType(expression, tools);
			if (NodeType.Unknown === type) return NodeType.Unknown;
			return disallowed_type(type, allowed_types, context, tools);
		}
	}
}

function disallowed_logical_expression(
	expression: TSESTree.LogicalExpression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	const type = getNodeType(expression, tools);

	if (NodeType.Unknown === type) return NodeType.Unknown;

	return disallowed_type(type, allowed_types, context, tools);
}

function disallowed_member_expression(
	expression: TSESTree.MemberExpression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | NodeType {
	const checker = tools.service.program.getTypeChecker();
	let objectType: TS.Type | NodeType = getNodeType(expression.object, tools);

	if (NodeType.Unknown === objectType) return NodeType.Unknown;

	// Handle nested member expressions
	if (expression.object.type === 'MemberExpression') {
		const nestedType = disallowed_member_expression(
			expression.object,
			allowed_types,
			context,
			tools
		);
		if (nestedType) objectType = nestedType;
	}

	if (NodeType.Allowed === objectType) return NodeType.Allowed;

	// Handle identifiers (variables)
	if (expression.object.type === 'Identifier') {
		const variable = findVariable(context, expression.object);
		if (variable && variable.defs[0]?.node.type === 'VariableDeclarator') {
			const initNode = variable.defs[0].node.init;
			if (initNode) {
				const initType = getNodeType(initNode, tools);
				if (initType) objectType = initType;
			}
		}
	}

	// Get property type
	const propertyName = getPropertyName(expression.property);
	if (!propertyName) return objectType;

	// Try to get property type using getPropertyOfType
	const symbol = checker.getPropertyOfType(objectType, propertyName);
	if (symbol) {
		const property_type = checker.getTypeOfSymbol(symbol);
		return disallowed_type(property_type, allowed_types, context, tools);
	}

	return NodeType.Unknown;
}

function getPropertyName(
	property: TSESTree.Expression | TSESTree.PrivateIdentifier
): string | undefined {
	if (property.type === 'Identifier') {
		return property.name;
	} else if (property.type === 'Literal' && typeof property.value === 'string') {
		return property.value;
	} else if (property.type === 'TemplateLiteral' && property.quasis.length === 1) {
		// return property.quasis[0].value.cooked;
	}
	return undefined;
}
