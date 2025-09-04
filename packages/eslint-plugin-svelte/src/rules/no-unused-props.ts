import { createRule } from '../utils/index.js';
import { getTypeScriptTools, isAnyType } from '../utils/ts-utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';
import type ts from 'typescript';
import { findVariable } from '../utils/ast-utils.js';
import { toRegExp } from '../utils/regexp.js';

type PropertyPathArray = string[];
type DeclaredPropertyNames = Set<{ originalName: string; aliasName: string }>;

let isRemovedWarningShown = false;

export default createRule('no-unused-props', {
	meta: {
		docs: {
			description: 'Warns about defined Props properties that are unused',
			category: 'Best Practices',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					checkImportedTypes: {
						type: 'boolean',
						default: false
					},
					ignoreTypePatterns: {
						type: 'array',
						items: {
							type: 'string'
						},
						default: []
					},
					ignorePropertyPatterns: {
						type: 'array',
						items: {
							type: 'string'
						},
						default: []
					},
					allowUnusedNestedProperties: {
						type: 'boolean',
						default: false
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			unusedProp: "'{{name}}' is an unused Props property.",
			unusedNestedProp: "'{{name}}' in '{{parent}}' is an unused property.",
			unusedIndexSignature:
				'Index signature is unused. Consider using rest operator (...) to capture remaining properties.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		]
	},
	create(context) {
		const fileName = context.filename;
		const tools = getTypeScriptTools(context);
		if (!tools) {
			return {};
		}

		const typeChecker = tools.service.program.getTypeChecker();
		if (!typeChecker) {
			return {};
		}

		const options = context.options[0] ?? {};

		// TODO: Remove in v4
		// MEMO: `ignorePatterns` was a property that only existed from v3.2.0 to v3.2.2.
		// From v3.3.0, it was replaced with `ignorePropertyPatterns` and `ignoreTypePatterns`.
		if (options.ignorePatterns != null && !isRemovedWarningShown) {
			console.warn(
				'eslint-plugin-svelte: The `ignorePatterns` option in the `no-unused-props` rule has been removed. Please use `ignorePropertyPatterns` or/and `ignoreTypePatterns` instead.'
			);
			isRemovedWarningShown = true;
		}

		const checkImportedTypes = options.checkImportedTypes ?? false;

		const ignoreTypePatterns = (options.ignoreTypePatterns ?? []).map((p: string | RegExp) => {
			if (typeof p === 'string') {
				return toRegExp(p);
			}
			return p;
		});

		const ignorePropertyPatterns = (options.ignorePropertyPatterns ?? []).map(
			(p: string | RegExp) => {
				if (typeof p === 'string') {
					return toRegExp(p);
				}
				return p;
			}
		);

		function shouldIgnoreProperty(name: string): boolean {
			return ignorePropertyPatterns.some((pattern: RegExp) => pattern.test(name));
		}

		function shouldIgnoreType(type: ts.Type): boolean {
			function isMatched(name: string): boolean {
				return ignoreTypePatterns.some((pattern: RegExp) => pattern.test(name));
			}

			const typeStr = typeChecker.typeToString(type);
			const symbol = type.getSymbol();
			const symbolName = symbol?.getName();
			return isMatched(typeStr) || (symbolName ? isMatched(symbolName) : false);
		}

		function isInternalProperty(symbol: ts.Symbol): boolean {
			const declarations = symbol.getDeclarations();
			if (!declarations || declarations.length === 0) return false;

			return declarations.every((decl) => decl.getSourceFile().fileName === fileName);
		}

		/**
		 * Extracts property paths from member expressions.
		 */
		function getPropertyPath(node: TSESTree.Identifier): PropertyPathArray {
			const paths: PropertyPathArray = [];
			let currentNode: TSESTree.Node = node;
			let parentNode: TSESTree.Node | null = currentNode.parent ?? null;

			while (parentNode) {
				if (parentNode.type === 'MemberExpression' && parentNode.object === currentNode) {
					const property = parentNode.property;
					if (property.type === 'Identifier') {
						paths.push(property.name);
					} else if (property.type === 'Literal' && typeof property.value === 'string') {
						paths.push(property.value);
					} else {
						break;
					}
				}
				currentNode = parentNode;
				parentNode = currentNode.parent ?? null;
			}

			return paths;
		}

		/**
		 * Finds all property access paths for a given variable.
		 */
		function getUsedNestedPropertyPathsArray(node: TSESTree.Identifier): PropertyPathArray[] {
			const variable = findVariable(context, node);
			if (!variable) return [];

			const pathsArray: PropertyPathArray[] = [];
			for (const reference of variable.references) {
				if (
					'identifier' in reference &&
					reference.identifier.type === 'Identifier' &&
					(reference.identifier.range[0] !== node.range[0] ||
						reference.identifier.range[1] !== node.range[1])
				) {
					const referencePath = getPropertyPath(reference.identifier);
					pathsArray.push(referencePath);
				}
			}
			return pathsArray;
		}

		/**
		 * Checks if a property is from TypeScript's built-in type definitions.
		 * These properties should be ignored as they are not user-defined props.
		 */
		function isBuiltInProperty(prop: ts.Symbol): boolean {
			const declarations = prop.getDeclarations();
			if (!declarations || declarations.length === 0) return false;

			const declaration = declarations[0];
			const sourceFile = declaration.getSourceFile();
			if (!sourceFile) return false;
			return sourceFile.fileName.includes('node_modules/typescript/lib/');
		}

		function getUsedPropertyNamesFromPattern(
			pattern: TSESTree.ObjectPattern
		): DeclaredPropertyNames {
			const usedProps: DeclaredPropertyNames = new Set();
			for (const prop of pattern.properties) {
				if (prop.type === 'Property') {
					if (prop.key.type === 'Identifier') {
						usedProps.add({ originalName: prop.key.name, aliasName: prop.key.name });
					} else if (
						prop.key.type === 'Literal' &&
						typeof prop.key.value === 'string' &&
						prop.value.type === 'Identifier'
					) {
						usedProps.add({ originalName: prop.key.value, aliasName: prop.value.name });
					}
				} else if (prop.type === 'RestElement') {
					// If there's a rest element, all properties are potentially used
					return new Set();
				}
			}

			return usedProps;
		}

		/**
		 * Check if the type is a class type (has constructor or prototype)
		 */
		function isClassType(type: ts.Type): boolean {
			if (!type) return false;

			// Check if it's a class instance type
			if (type.isClass()) return true;

			// Check for constructor signatures
			const constructorType = type.getConstructSignatures();
			if (constructorType.length > 0) return true;

			// Check if it has a prototype property
			const symbol = type.getSymbol();
			if (symbol?.members?.has('prototype' as ts.__String)) return true;

			return false;
		}

		/**
		 * Recursively checks for unused properties in a type.
		 */
		function checkUnusedProperties({
			propsType,
			usedPropertyPaths,
			declaredPropertyNames,
			reportNode,
			parentPath,
			checkedPropsTypes,
			reportedPropertyPaths
		}: {
			propsType: ts.Type;
			usedPropertyPaths: string[];
			declaredPropertyNames: DeclaredPropertyNames;
			reportNode: TSESTree.Node;
			parentPath: string[];
			checkedPropsTypes: Set<string>;
			reportedPropertyPaths: Set<string>;
		}) {
			// Skip checking if the type itself is a class
			if (isClassType(propsType)) return;

			const typeStr = typeChecker.typeToString(propsType);
			if (checkedPropsTypes.has(typeStr)) return;
			checkedPropsTypes.add(typeStr);
			if (shouldIgnoreType(propsType)) return;

			const properties = typeChecker.getPropertiesOfType(propsType);
			const propsBaseTypes = propsType.getBaseTypes();

			if (!properties.length && (!propsBaseTypes || propsBaseTypes.length === 0)) {
				return;
			}

			if (propsBaseTypes) {
				for (const propsBaseType of propsBaseTypes) {
					checkUnusedProperties({
						propsType: propsBaseType,
						usedPropertyPaths,
						declaredPropertyNames,
						reportNode,
						parentPath,
						checkedPropsTypes,
						reportedPropertyPaths
					});
				}
			}

			for (const prop of properties) {
				if (isBuiltInProperty(prop)) continue;
				if (!checkImportedTypes && !isInternalProperty(prop)) continue;

				const propName = prop.getName();
				if (shouldIgnoreProperty(propName)) continue;

				const currentPath = [...parentPath, propName];
				const currentPathStr = [...parentPath, propName].join('.');

				if (reportedPropertyPaths.has(currentPathStr)) continue;

				const propType = typeChecker.getTypeOfSymbol(prop);

				const isUsedThisInPath = usedPropertyPaths.includes(currentPathStr);
				const isUsedInPath = usedPropertyPaths.some((path) => {
					return path.startsWith(`${currentPathStr}.`);
				});

				if (isUsedThisInPath && !isUsedInPath) {
					continue;
				}

				const isUsedInProps = Array.from(declaredPropertyNames).some((p) => {
					return p.originalName === propName;
				});

				if (!isUsedInPath && !isUsedInProps) {
					reportedPropertyPaths.add(currentPathStr);
					context.report({
						node: reportNode,
						messageId: parentPath.length ? 'unusedNestedProp' : 'unusedProp',
						data: {
							name: propName,
							parent: parentPath.join('.')
						}
					});
					continue;
				}

				const isUsedNested = usedPropertyPaths.some((path) => {
					return path.startsWith(`${currentPathStr}.`);
				});

				if (isUsedNested || isUsedInProps) {
					checkUnusedProperties({
						propsType: propType,
						usedPropertyPaths,
						declaredPropertyNames,
						reportNode,
						parentPath: currentPath,
						checkedPropsTypes,
						reportedPropertyPaths
					});
				}
			}

			// Check for unused index signatures only at the root level
			if (parentPath.length === 0) {
				const indexType = propsType.getStringIndexType();
				const numberIndexType = propsType.getNumberIndexType();
				const hasIndexSignature =
					Boolean(indexType && !isAnyType(indexType, tools!.ts)) ||
					Boolean(numberIndexType && !isAnyType(numberIndexType, tools!.ts));

				if (hasIndexSignature && !hasRestElement(declaredPropertyNames)) {
					context.report({
						node: reportNode,
						messageId: 'unusedIndexSignature'
					});
				}
			}
		}

		/**
		 * Returns true if the destructuring pattern includes a rest element,
		 * which means all remaining properties are potentially used.
		 */
		function hasRestElement(declaredPropertyNames: DeclaredPropertyNames): boolean {
			return declaredPropertyNames.size === 0;
		}

		function normalizeUsedPaths(
			paths: PropertyPathArray[],
			allowUnusedNestedProperties: boolean
		): PropertyPathArray[] {
			const normalized: PropertyPathArray[] = [];
			for (const path of paths.sort((a, b) => a.length - b.length)) {
				if (path.length === 0) continue;
				if (normalized.some((p) => p.every((part, idx) => part === path[idx]))) {
					continue;
				}
				normalized.push(path);
			}
			return normalized.map((path) => {
				// If we allow unused nested properties, only return first level properties
				if (allowUnusedNestedProperties) return [path[0]];
				return path;
			});
		}

		return {
			'VariableDeclaration > VariableDeclarator': (node: TSESTree.VariableDeclarator) => {
				// Only check $props declarations
				if (
					node.init?.type !== 'CallExpression' ||
					node.init.callee.type !== 'Identifier' ||
					node.init.callee.name !== '$props'
				) {
					return;
				}

				const tsNode = tools.service.esTreeNodeToTSNodeMap.get(node) as ts.VariableDeclaration;
				if (!tsNode || !tsNode.type) return;

				const propsType = typeChecker.getTypeFromTypeNode(tsNode.type);
				let usedPropertyPathsArray: PropertyPathArray[] = [];
				let declaredPropertyNames: DeclaredPropertyNames = new Set();

				if (node.id.type === 'ObjectPattern') {
					declaredPropertyNames = getUsedPropertyNamesFromPattern(node.id);
					if (declaredPropertyNames.size === 0) return;
					const identifiers: TSESTree.Identifier[] = [];
					for (const p of node.id.properties) {
						if (p.type !== 'Property') {
							continue;
						}
						if (p.value.type === 'Identifier') {
							identifiers.push(p.value);
						} else if (p.value.type === 'AssignmentPattern' && p.value.left.type === 'Identifier') {
							identifiers.push(p.value.left);
						}
					}
					for (const identifier of identifiers) {
						const paths = getUsedNestedPropertyPathsArray(identifier);
						usedPropertyPathsArray.push(...paths.map((path) => [identifier.name, ...path]));
					}
				} else if (node.id.type === 'Identifier') {
					usedPropertyPathsArray = getUsedNestedPropertyPathsArray(node.id);
				}

				checkUnusedProperties({
					propsType,
					usedPropertyPaths: normalizeUsedPaths(
						usedPropertyPathsArray,
						options.allowUnusedNestedProperties
					).map((pathArray) => {
						return pathArray.join('.');
					}),
					declaredPropertyNames,
					reportNode: node.id,
					parentPath: [],
					checkedPropsTypes: new Set<string>(),
					reportedPropertyPaths: new Set<string>()
				});
			}
		};
	}
});
