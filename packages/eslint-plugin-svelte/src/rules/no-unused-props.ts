import { createRule } from '../utils/index.js';
import { getTypeScriptTools, isAnyType } from '../utils/ts-utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';
import type ts from 'typescript';
import { findVariable } from '../utils/ast-utils.js';
import { toRegExp } from '../utils/regexp.js';
import { normalize } from 'path';
import type { AST as SvAST } from 'svelte-eslint-parser';

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

			// TypeScript declaration file name is normalized to support Windows style paths
			return declarations.every((decl) => normalize(decl.getSourceFile().fileName) === fileName);
		}

		/**
		 * Extracts property paths from member expressions.
		 *
		 * `spread` is `'object'` when the value is spread into an object literal or
		 * onto a Svelte element/component, which copies every property of it, and
		 * `'iterable'` when it is spread into an array literal or call arguments,
		 * which only iterates it.
		 */
		function getPropertyPath(node: TSESTree.Identifier): {
			paths: PropertyPathArray;
			spread: 'object' | 'iterable' | null;
		} {
			const paths: PropertyPathArray = [];
			let spread: 'object' | 'iterable' | null = null;
			let currentNode: TSESTree.Node | SvAST.SvelteSpreadAttribute = node;
			let parentNode: TSESTree.Node | SvAST.SvelteSpreadAttribute | null =
				currentNode.parent ?? null;
			while (parentNode) {
				if (parentNode.type === 'MemberExpression' && parentNode.object === currentNode) {
					const property = parentNode.property;
					if (property.type === 'Identifier') {
						paths.push(property.name);
					} else if (property.type === 'Literal' && typeof property.value === 'string') {
						paths.push(property.value);
					}
				} else {
					if (parentNode.type === 'SvelteSpreadAttribute') {
						spread = 'object';
					} else if (parentNode.type === 'SpreadElement') {
						spread = parentNode.parent?.type === 'ObjectExpression' ? 'object' : 'iterable';
					}
					break;
				}

				currentNode = parentNode;
				parentNode = (currentNode.parent as TSESTree.Node | SvAST.SvelteSpreadAttribute) ?? null;
			}

			return { paths, spread };
		}

		/**
		 * Finds all property access paths for a given variable.
		 */
		function getUsedNestedPropertyPathsArray(node: TSESTree.Identifier): {
			paths: PropertyPathArray[];
			objectSpreadPaths: PropertyPathArray[];
			iterableSpreadPaths: PropertyPathArray[];
		} {
			const variable = findVariable(context, node);
			if (!variable) return { paths: [], objectSpreadPaths: [], iterableSpreadPaths: [] };

			const pathsArray: PropertyPathArray[] = [];
			const objectSpreadPathsArray: PropertyPathArray[] = [];
			const iterableSpreadPathsArray: PropertyPathArray[] = [];
			for (const reference of variable.references) {
				if (
					'identifier' in reference &&
					reference.identifier.type === 'Identifier' &&
					(reference.identifier.range[0] !== node.range[0] ||
						reference.identifier.range[1] !== node.range[1])
				) {
					const { paths, spread } = getPropertyPath(reference.identifier);
					if (spread === 'object') {
						objectSpreadPathsArray.push(paths);
					} else if (spread === 'iterable') {
						iterableSpreadPathsArray.push(paths);
					} else {
						pathsArray.push(paths);
					}
				}
			}

			return {
				paths: pathsArray,
				objectSpreadPaths: objectSpreadPathsArray,
				iterableSpreadPaths: iterableSpreadPathsArray
			};
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
		 * Checks whether `path` is `prefix` itself or sits beneath it. Segments are
		 * compared one by one, so a property name that contains a dot is not read as
		 * a nested path.
		 */
		function isPathAtOrUnder(path: string[], prefix: string[]): boolean {
			if (prefix.length > path.length) return false;
			return prefix.every((segment, index) => segment === path[index]);
		}

		/**
		 * Checks whether `path` sits strictly beneath `prefix`.
		 */
		function isPathUnder(path: string[], prefix: string[]): boolean {
			return path.length > prefix.length && isPathAtOrUnder(path, prefix);
		}

		function isSamePath(a: string[], b: string[]): boolean {
			return a.length === b.length && isPathAtOrUnder(a, b);
		}

		/**
		 * Recursively checks for unused properties in a type.
		 */
		function checkUnusedProperties({
			propsType,
			usedPropertyPaths,
			usedObjectSpreadPropertyPaths,
			usedIterableSpreadPropertyPaths,
			declaredPropertyNames,
			reportNode,
			parentPath,
			checkingPropsTypes,
			reportedPropertyPaths
		}: {
			propsType: ts.Type;
			usedPropertyPaths: PropertyPathArray[];
			usedObjectSpreadPropertyPaths: PropertyPathArray[];
			usedIterableSpreadPropertyPaths: PropertyPathArray[];
			declaredPropertyNames: DeclaredPropertyNames;
			reportNode: TSESTree.Node;
			parentPath: string[];
			checkingPropsTypes: Set<string>;
			reportedPropertyPaths: Set<string>;
		}) {
			// Skip checking if the type itself is a class
			if (isClassType(propsType)) return;

			// Only types that are being checked further up the current path are skipped,
			// which stops recursive types from looping while still checking two sibling
			// properties that share a type.
			const typeStr = typeChecker.typeToString(propsType);
			if (checkingPropsTypes.has(typeStr)) return;
			if (shouldIgnoreType(propsType)) return;

			checkingPropsTypes.add(typeStr);
			try {
				checkPropertiesOfType({
					propsType,
					usedPropertyPaths,
					usedObjectSpreadPropertyPaths,
					usedIterableSpreadPropertyPaths,
					declaredPropertyNames,
					reportNode,
					parentPath,
					checkingPropsTypes,
					reportedPropertyPaths
				});
			} finally {
				checkingPropsTypes.delete(typeStr);
			}
		}

		function checkPropertiesOfType({
			propsType,
			usedPropertyPaths,
			usedObjectSpreadPropertyPaths,
			usedIterableSpreadPropertyPaths,
			declaredPropertyNames,
			reportNode,
			parentPath,
			checkingPropsTypes,
			reportedPropertyPaths
		}: Parameters<typeof checkUnusedProperties>[0]) {
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
						usedObjectSpreadPropertyPaths,
						usedIterableSpreadPropertyPaths,
						declaredPropertyNames,
						reportNode,
						parentPath,
						checkingPropsTypes,
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
				// Serialized so that a property name containing a dot cannot collide with a
				// nested path.
				const currentPathKey = JSON.stringify(currentPath);

				if (reportedPropertyPaths.has(currentPathKey)) continue;

				// Spreading this property, or any of its ancestors, into an object consumes
				// everything beneath it, so nothing under it can be reported -- even when
				// some of those properties are also read by name.
				const isCoveredByObjectSpread = usedObjectSpreadPropertyPaths.some((path) => {
					return isPathAtOrUnder(currentPath, path);
				});
				if (isCoveredByObjectSpread) continue;

				const propType = typeChecker.getTypeOfSymbol(prop);

				const isUsedThisInPath =
					usedPropertyPaths.some((path) => isSamePath(path, currentPath)) ||
					// A spread deeper inside this property counts as using the property itself.
					usedObjectSpreadPropertyPaths.some((path) => isPathUnder(path, currentPath)) ||
					// Spreading into an array or call arguments only iterates the value, so it
					// does not consume properties that are also read by name.
					usedIterableSpreadPropertyPaths.some((path) => {
						return path.length === 0 || isPathAtOrUnder(path, currentPath);
					});
				const isUsedInPath = usedPropertyPaths.some((path) => isPathUnder(path, currentPath));

				if (isUsedThisInPath && !isUsedInPath) {
					continue;
				}

				// Destructured names only refer to top level properties.
				const isUsedInProps =
					parentPath.length === 0 &&
					Array.from(declaredPropertyNames).some((p) => {
						return p.originalName === propName;
					});

				if (!isUsedInPath && !isUsedInProps) {
					reportedPropertyPaths.add(currentPathKey);
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

				checkUnusedProperties({
					propsType: propType,
					usedPropertyPaths,
					usedObjectSpreadPropertyPaths,
					usedIterableSpreadPropertyPaths,
					declaredPropertyNames,
					reportNode,
					parentPath: currentPath,
					checkingPropsTypes,
					reportedPropertyPaths
				});
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
				if (normalized.some((p) => isPathAtOrUnder(path, p))) {
					continue;
				}
				normalized.push(path);
			}
			return normalized.map((path) => {
				// If we allow unused nested properties, only return first level properties.
				// An empty path means the whole object was used, so it has no first level
				// to narrow to and must stay empty.
				if (allowUnusedNestedProperties && path.length > 0) return [path[0]];
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
				const usedPropertyPathsArray: PropertyPathArray[] = [];
				const usedObjectSpreadPropertyPathsArray: PropertyPathArray[] = [];
				const usedIterableSpreadPropertyPathsArray: PropertyPathArray[] = [];
				let declaredPropertyNames: DeclaredPropertyNames = new Set();

				if (node.id.type === 'ObjectPattern') {
					declaredPropertyNames = getUsedPropertyNamesFromPattern(node.id);
					if (declaredPropertyNames.size === 0) return;
					// Each local variable paired with the name of the prop it holds, so that
					// `{ app: a }` records `a.name` as `app.name`.
					const identifiers: { identifier: TSESTree.Identifier; propName: string }[] = [];
					for (const p of node.id.properties) {
						if (p.type !== 'Property' || p.computed) {
							continue;
						}
						const propName =
							p.key.type === 'Identifier'
								? p.key.name
								: p.key.type === 'Literal' && typeof p.key.value === 'string'
									? p.key.value
									: null;
						if (propName == null) continue;
						if (p.value.type === 'Identifier') {
							identifiers.push({ identifier: p.value, propName });
						} else if (p.value.type === 'AssignmentPattern' && p.value.left.type === 'Identifier') {
							identifiers.push({ identifier: p.value.left, propName });
						}
					}
					for (const { identifier, propName } of identifiers) {
						const { paths, objectSpreadPaths, iterableSpreadPaths } =
							getUsedNestedPropertyPathsArray(identifier);
						usedPropertyPathsArray.push(...paths.map((path) => [propName, ...path]));
						usedObjectSpreadPropertyPathsArray.push(
							...objectSpreadPaths.map((path) => [propName, ...path])
						);
						usedIterableSpreadPropertyPathsArray.push(
							...iterableSpreadPaths.map((path) => [propName, ...path])
						);
					}
				} else if (node.id.type === 'Identifier') {
					const { paths, objectSpreadPaths, iterableSpreadPaths } = getUsedNestedPropertyPathsArray(
						node.id
					);
					usedPropertyPathsArray.push(...paths);
					usedObjectSpreadPropertyPathsArray.push(...objectSpreadPaths);
					usedIterableSpreadPropertyPathsArray.push(...iterableSpreadPaths);
				}

				function runNormalizeUsedPaths(paths: PropertyPathArray[]) {
					return normalizeUsedPaths(paths, options.allowUnusedNestedProperties);
				}

				checkUnusedProperties({
					propsType,
					usedPropertyPaths: runNormalizeUsedPaths(usedPropertyPathsArray),
					usedObjectSpreadPropertyPaths: runNormalizeUsedPaths(usedObjectSpreadPropertyPathsArray),
					usedIterableSpreadPropertyPaths: runNormalizeUsedPaths(
						usedIterableSpreadPropertyPathsArray
					),
					declaredPropertyNames,
					reportNode: node.id,
					parentPath: [],
					checkingPropsTypes: new Set<string>(),
					reportedPropertyPaths: new Set<string>()
				});
			}
		};
	}
});
