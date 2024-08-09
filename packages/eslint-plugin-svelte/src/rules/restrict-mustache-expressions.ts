import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import { TypeFlags } from 'typescript';
import type { TSESTree } from '@typescript-eslint/types';
import type { TS, TSTools } from '../utils/ts-utils';
import { getConstrainedTypeAtLocation, getTypeName, getTypeScriptTools } from '../utils/ts-utils';
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

			const disallowed = disallowed_expression(node.expression, allowed_types, context, tools!);
			if (!disallowed) return;

			context.report({
				node,
				messageId: 'expectedStringifyableType',
				data: {
					disallowed: getTypeName(disallowed, tools!),
					types: [...allowed_types].map((t) => `\`${t}\``).join(', ')
				}
			});
		}

		return {
			SvelteMustacheTag: checkMustacheExpression
		};
	}
});

function getNodeType(
	node: TSESTree.Expression | TSESTree.PrivateIdentifier | TSESTree.SpreadElement,
	tools: TSTools
): TS.Type | null {
	const tsNode = tools.service.esTreeNodeToTSNodeMap.get(node);
	return (
		(tsNode && getConstrainedTypeAtLocation(tools.service.program.getTypeChecker(), tsNode)) || null
	);
}

function disallowed_identifier(
	expression: TSESTree.Identifier,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
	const type = getNodeType(expression, tools);

	if (!type) return null;

	return disallowed_type(type, allowed_types, context, tools);
}

function disallowed_type(
	type: TS.Type,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
	if (type.flags & TypeFlags.StringLike) {
		return null;
	}
	if (type.flags & TypeFlags.BooleanLike) {
		return allowed_types.has('boolean') ? null : type;
	}
	if (type.flags & TypeFlags.NumberLike) {
		return allowed_types.has('number') ? null : type;
	}
	if (type.flags & TypeFlags.Null) {
		return allowed_types.has('null') ? null : type;
	}
	if (type.flags & TypeFlags.Undefined) {
		return allowed_types.has('undefined') ? null : type;
	}
	if (type.isUnion()) {
		for (const sub_type of type.types) {
			const disallowed = disallowed_type(sub_type, allowed_types, context, tools);
			if (disallowed) {
				return disallowed;
			}
		}
		return null;
	}

	return type;
}

function disallowed_literal(
	expression: TSESTree.Literal,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
	const type = getNodeType(expression, tools);

	if (!type) return null;

	return disallowed_type(type, allowed_types, context, tools);
}

function disallowed_expression(
	expression: TSESTree.Expression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
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
		default:
			return getNodeType(expression, tools);
	}
}

function disallowed_logical_expression(
	expression: TSESTree.LogicalExpression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
	const type = getNodeType(expression, tools);

	if (!type) return null;

	return disallowed_type(type, allowed_types, context, tools);
}

// function disallowed_member_expression(
// 	expression: TSESTree.MemberExpression,
// 	allowed_types: Set<string>,
// 	context: RuleContext,
// 	tools: TSTools
// ): TS.Type | null {
// 	const checker = tools.service.program.getTypeChecker();
// 	const type = getNodeType(expression, tools);
// 	if (!type) return null;

// 	const object = expression.object;
// 	if (object.type === 'Identifier') {
// 		const variable = findVariable(context, object);
// 		if (!variable) return null;
// 		const node_def = variable.defs[0].node;
// 		if (node_def.type !== 'VariableDeclarator') return null;
// 		if (!node_def.init) return null;
// 		// let type = getNodeType(node_def.init, tools);
// 		if (node_def.init.type !== 'ObjectExpression') return null;
// 		if (expression.property.type !== 'Identifier') return null;

// 		const type = getNodeType(node_def.init, tools);
// 		if (!type) return null;
// 		const symbol = checker.getPropertyOfType(type, expression.property.name);
// 		if (!symbol) return null;

// 		const prop_type = checker.getTypeOfSymbol(symbol);

// 		return disallowed_type(prop_type, allowed_types, context, tools);
// 	}

// 	return disallowed_type(type, allowed_types, context, tools);
// }

function disallowed_member_expression(
	expression: TSESTree.MemberExpression,
	allowed_types: Set<string>,
	context: RuleContext,
	tools: TSTools
): TS.Type | null {
	const checker = tools.service.program.getTypeChecker();
	let objectType = getNodeType(expression.object, tools);

	if (!objectType) return null;

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

	let propertyType: TS.Type | undefined;

	// Try to get property type using getPropertyOfType
	const symbol = checker.getPropertyOfType(objectType, propertyName);
	if (symbol) {
		propertyType = checker.getTypeOfSymbol(symbol);
	}

	// If property type is still not found, try using getTypeOfPropertyOfType
	if (!propertyType) {
		const property_symbol = checker.getPropertyOfType(objectType, propertyName);
		if (property_symbol) {
			propertyType = checker.getTypeOfSymbol(property_symbol);
		}
	}

	// If we found a property type, use it; otherwise, fall back to the object type
	return propertyType
		? disallowed_type(propertyType, allowed_types, context, tools)
		: disallowed_type(objectType, allowed_types, context, tools);
}

function getPropertyName(
	property: TSESTree.Expression | TSESTree.PrivateIdentifier
): string | undefined {
	if (property.type === 'Identifier') {
		return property.name;
	} else if (property.type === 'Literal' && typeof property.value === 'string') {
		return property.value;
	} else if (property.type === 'TemplateLiteral' && property.quasis.length === 1) {
		return property.quasis[0].value.cooked;
	}
	return undefined;
}
