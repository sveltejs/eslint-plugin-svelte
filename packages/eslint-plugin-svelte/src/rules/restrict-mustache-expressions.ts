/* eslint-disable @eslint-community/eslint-comments/require-description */
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import ts, { TypeFlags } from 'typescript';
import { getScope } from '../utils/ast-utils';
import type { RuleContext } from '../types';
import type { TSESTree } from '@typescript-eslint/utils';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- ignore
import { ESLintUtils } from '@typescript-eslint/utils';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/parser';
import type { TS } from '../utils/ts-utils';
import { getInnermostScope } from '@eslint-community/eslint-utils';

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

function findVariable(context: RuleContext, node: TSESTree.Identifier): Variable | null {
	const initialScope = getInnermostScope(context, node)
	const variable = eslintUtils.findVariable(initialScope, node);
	if (variable) {
		return variable;
	}
	if (!node.name.startsWith('$')) {
		return variable;
	}
	// Remove the $ and search for the variable again, as it may be a store access variable.
	return eslintUtils.findVariable(initialScope, node.name.slice(1));
}

function print_node(node: TSESTree.Node, services: ParserServicesWithTypeInformation) {
	const checker = services.program.getTypeChecker();
	const type = services.getTypeAtLocation(node);
	console.log(checker.typeToString(type));
}

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const services = ESLintUtils.getParserServices(context as any);
		const checker = services.program.getTypeChecker();

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

			print_node(node.expression as any, services);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const type = compute_expression_type(node.expression as any, context, services);

			if (type !== null && is_allowed_type(type, allowed_types, context, services)) return;

			context.report({
				node,
				messageId: 'expectedStringifyableType',
				data: {
					disallowed: type === null ? 'unknown' : checker.typeToString(type),
					types: [...allowed_types].map((t) => `\`${t}\``).join(', ')
				}
			});
		}

		return {
			SvelteMustacheTag: checkMustacheExpression
		};
	}
});

function get_node_type(
	node: TSESTree.Node,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	const checker = services.program.getTypeChecker();
	const type = services.getTypeAtLocation(node);
	return checker.getBaseConstraintOfType(type) ?? type;
}

function compute_identifier_type(
	expression: TSESTree.Identifier,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	return get_variable_type(expression, context, services);
}

function get_variable_type(
	identifier: TSESTree.Identifier,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	const variable = findVariable(context, identifier);
	const checker = services.program.getTypeChecker();

	if (variable) {
		const identifierNode = variable.identifiers[0];
		const type_node = services.getTypeAtLocation(identifier);
		const constrained = checker.getBaseConstraintOfType(type_node);
		// const type = checker.getTypeFromTypeNode(;
		// console.log(variable.name);
		// console.log('Type from annotation', checker.typeToString(type_node));
		// console.log('Constrained type', constrained ? checker.typeToString(constrained) : null);
		// console.log('-------');
		return type_node;
	}

	const type = get_node_type(identifier, services);
	// console.log('Type from node:', type ? checker.typeToString(type) : null);
	return type;

	// if (variable?.name === 'side') {
	// 	console.log('Variable', variable);

	// 	// checker.
	// 	// const def = variable.defs[0];
	// 	// console.log(variable.identifiers[0].typeAnnotation?.typeAnnotation);
	// 	const type = get_node_type(variable.identifiers[0], services;
	// 	if (!type) return null;
	// 	console.log(checker.getApparentType(type));
	// 	// console.log('NODE TYPE', type);
	// 	// if (!type) return null;
	// 	// console.log('TYPE STRING:', checker.typeToString(type));
	// }
	// const identifiers = variable?.identifiers[0];

	// if (!identifiers) return get_node_type(identifier, services;

	// const type = get_node_type(variable.identifiers[0], services;

	// if (type === null) return null;

	// return narrow_variable_type(identifier, type, services;
}

function narrow_variable_type(
	identifier: TSESTree.Identifier,
	type: TS.Type,
	services: ParserServicesWithTypeInformation
): TS.Type {
	const checker = services.program.getTypeChecker();
	let currentNode: TSESTree.Node | AST.SvelteNode | undefined = identifier as TSESTree.Node;

	while (currentNode) {
		if (currentNode.type === 'SvelteIfBlock') {
			const condition = currentNode.expression;
			// TODO: other cases of conditionals
			if (condition.type === 'Identifier' && condition.name === identifier.name) {
				return checker.getNonNullableType(type);
			}
		}
		currentNode = currentNode.parent as TSESTree.Node | AST.SvelteNode;
	}

	return type;
}

function is_allowed_type(
	type: TS.Type,
	allowed_types: Set<string>,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): boolean {
	if (type.flags & TypeFlags.StringLike) return true;
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
			if (!is_allowed_type(sub_type, allowed_types, context, services)) return false;
		}
		return true;
	}

	return false;
}

function compute_literal_type(
	expression: TSESTree.Literal,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	return get_node_type(expression, services);
}

function compute_logical_expression_type(
	expression: TSESTree.LogicalExpression,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	// TODO: Do we need to check the type of the left and right expressions more?
	return get_node_type(expression, services);
}

function compute_member_expression_type(
	expression: TSESTree.MemberExpression,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	const object_type = compute_expression_type(expression.object, context, services);
	if (!object_type) return null;

	if (expression.computed) {
		const property_type = compute_expression_type(expression.property, context, services);
		if (property_type === null) return null;
		return compute_property_return_type(object_type, property_type, services);
	}

	return compute_property(object_type, expression.property.name, services);
}

function compute_property(
	object_type: TS.Type,
	property_name: string,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	const checker = services.program.getTypeChecker();
	const symbol = checker.getPropertyOfType(object_type, property_name);
	return symbol ? checker.getTypeOfSymbol(symbol) : null;
}

function compute_expression_type(
	expression: TSESTree.Expression,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	switch (expression.type) {
		case 'Identifier':
			return compute_identifier_type(expression, context, services);
		case 'Literal':
			return compute_literal_type(expression, services);
		case 'MemberExpression':
			return compute_member_expression_type(expression, context, services);
		case 'ArrayExpression':
			return compute_array_expression_type(expression, context, services);
		case 'LogicalExpression':
			return compute_logical_expression_type(expression, services);
		case 'ConditionalExpression':
			return compute_conditional_expression_type(expression, context, services);
		default:
			return null;
	}
}

function create_union_type(
	types: TS.Type[],
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	const checker = services.program.getTypeChecker();

	const new_types: TS.TypeNode[] = [];

	for (const type of types) {
		const node = checker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.NoTruncation);
		if (!node) return null;
		new_types.push(node);
	}

	const union_type = ts.factory.createUnionTypeNode(new_types);

	return checker.getTypeFromTypeNode(union_type);
}

function compute_property_return_type(
	object_type: TS.Type,
	property_type: TS.Type,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	// const checker = tools.service.program.getTypeChecker();
	// // print the raw source code of the property type
	// console.log('Property type', checker.typeToString(property_type));

	if (property_type.isStringLiteral()) {
		return compute_property(object_type, property_type.value, services);
	} else if (property_type.isNumberLiteral()) {
		const number_index_type = property_type.getNumberIndexType();
		if (number_index_type === undefined) return null;
		console.log('Number index type', number_index_type);
		return compute_property_return_type(object_type, number_index_type, services);
	} else if (property_type.isUnion()) {
		const types: TS.Type[] = [];
		for (const type of property_type.types) {
			const subtype = compute_property_return_type(object_type, type, services);
			if (subtype === null) return null;
			types.push(subtype);
		}
		return create_union_type([...types], services);
	}
	return null;
}

function compute_array_expression_type(
	expression: TSESTree.ArrayExpression,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	return get_node_type(expression, services);
}

function compute_conditional_expression_type(
	expression: TSESTree.ConditionalExpression,
	context: RuleContext,
	services: ParserServicesWithTypeInformation
): TS.Type | null {
	return get_node_type(expression, services);
}
