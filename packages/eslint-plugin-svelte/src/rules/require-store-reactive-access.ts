import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import {
	createCallableChecker,
	createStoreChecker,
	extractStoreReferences
} from './reference-helpers/svelte-store.js';
import { findAttribute, findVariable } from '../utils/ast-utils.js';
import { getSvelteContext } from '../utils/svelte-context.js';
import { getTypeScriptTools } from '../utils/ts-utils/index.js';

export default createRule('require-store-reactive-access', {
	meta: {
		docs: {
			description:
				'disallow to use of the store itself as an operand. Need to use $ prefix or get function.',
			category: 'Possible Errors',
			recommended: true
		},
		fixable: 'code',
		schema: [],
		messages: {
			usingRawStoreInText:
				'Use the $ prefix or the get function to access reactive values instead of accessing the raw store.'
		},
		type: 'problem'
	},
	create(context) {
		if (!context.sourceCode.parserServices.isSvelte) {
			return {};
		}
		const isStore = createStoreChecker(context);
		const isCallable = createCallableChecker(context);
		const hasTypeInfo = Boolean(getTypeScriptTools(context));
		// Svelte 3/4 does not treat `on*` attributes as event handlers.
		const supportsEventAttributes = getSvelteContext(context)?.svelteVersion !== '3/4';
		let storeCreatorCalls: Set<TSESTree.Node> | null = null;
		const moduleScripts = (context.sourceCode.ast as unknown as AST.SvelteProgram).body.filter(
			(node): node is AST.SvelteScriptElement =>
				node.type === 'SvelteScriptElement' && isModuleScript(node)
		);

		/** Verify for expression node */
		function verifyExpression(
			node: TSESTree.Expression | null | undefined,
			options?: { disableFix?: boolean; consistent?: boolean; allowCallable?: boolean }
		) {
			if (!node) return;
			if (!isStore(node, { consistent: options?.consistent })) {
				return;
			}
			if (options?.allowCallable && isCallable(node)) {
				// Some stores are also functions (e.g. melt-ui builders are stores and actions).
				// Using them as functions is fine.
				return;
			}
			context.report({
				node,
				messageId: 'usingRawStoreInText',
				fix:
					node.type === 'Identifier' && !options?.disableFix && canUseStorePrefix(node)
						? (fixer) => fixer.insertTextBefore(node, '$')
						: null
			});
		}

		/**
		 * Checks whether the `$` prefix can be used for the given identifier.
		 * Svelte only allows it for stores declared at the top level of the component,
		 * and not inside the module script.
		 */
		function canUseStorePrefix(node: TSESTree.Identifier) {
			const variable = findVariable(context, node);
			if (!variable || variable.scope.type !== 'module') {
				return false;
			}
			return !moduleScripts.some(
				(script) => script.range[0] <= node.range[0] && node.range[1] <= script.range[1]
			);
		}

		return {
			SvelteMustacheTag(node) {
				if (canAcceptStoreMustache(node)) {
					return;
				}
				// Check for <p>{store}<p/>, etc.
				verifyExpression(node.expression, {
					// e.g. <button onclick={store} />
					allowCallable: isEventAttributeValue(node)
				});
			},
			SvelteShorthandAttribute(node) {
				if (canAcceptStoreAttributeElement(node.parent.parent)) {
					return;
				}
				// Check for <div {store} />
				verifyExpression(node.value, {
					disableFix: true,
					// e.g. <button {onclick} />
					allowCallable: isEventAttributeName(node.key.name)
				});
			},
			SvelteSpreadAttribute(node) {
				// Check for <Foo {...store} />
				verifyExpression(node.argument);
			},
			SvelteDirective(node) {
				if (node.kind === 'Action' || node.kind === 'Animation' || node.kind === 'Transition') {
					if (node.key.name.type !== 'Identifier') {
						return;
					}
					// Check for <button use:store />, <div animate:store />, or <div transition:store />
					verifyExpression(node.key.name, { allowCallable: true });
				} else if (node.kind === 'Binding') {
					if (node.key.name.name !== 'this' && canAcceptStoreAttributeElement(node.parent.parent)) {
						return;
					}
					// Check for <input bind:value={ () => {}, (v) => {} } />
					if (node.expression?.type === 'SvelteFunctionBindingsExpression') {
						for (const expr of node.expression.expressions) {
							verifyExpression(expr, {
								disableFix: node.shorthand
							});
						}
					} else {
						// Check for <input bind:value={store} />
						verifyExpression(node.expression, {
							disableFix: node.shorthand
						});
					}
				} else if (node.kind === 'Class') {
					// Check for <div class:foo={store} />
					verifyExpression(node.expression, {
						disableFix: node.shorthand,
						consistent: true
					});
				} else if (node.kind === 'EventHandler') {
					// Check for <button on:click={store} />
					verifyExpression(node.expression, { allowCallable: true });
				}
			},
			SvelteStyleDirective(node) {
				if (node.shorthand && node.key.name.type === 'Identifier') {
					// Check for <div style:color />
					verifyExpression(node.key.name, {
						disableFix: true
					});
				}
				// The longform has already been checked in SvelteMustacheTag
			},
			SvelteSpecialDirective(node) {
				if (node.kind === 'this') {
					// Check for <button this={store} />
					verifyExpression(node.expression);
				}
			},
			'SvelteIfBlock, SvelteAwaitBlock'(node: AST.SvelteIfBlock | AST.SvelteAwaitBlock) {
				// Check for {#if store}, {#await store}
				verifyExpression(node.expression, {
					consistent: true
				});
			},
			SvelteEachBlock(node) {
				// Check for {#each store}
				verifyExpression(node.expression);
			},
			['IfStatement, WhileStatement, DoWhileStatement, ConditionalExpression, ForStatement'](
				node:
					| TSESTree.IfStatement
					| TSESTree.WhileStatement
					| TSESTree.DoWhileStatement
					| TSESTree.ConditionalExpression
					| TSESTree.ForStatement
			) {
				// Check for `if (store)`, `while (store)`, `do {} while (store)`,
				//   `store ? a : b`, `for (;store;)`
				verifyExpression(node.test, {
					consistent: true
				});
			},
			'ForInStatement, ForOfStatement'(node: TSESTree.ForInStatement | TSESTree.ForOfStatement) {
				// Check for `for (let foo of store)`, `for (let foo in store)`
				verifyExpression(node.right);
			},
			SwitchStatement(node: TSESTree.SwitchStatement) {
				// Check for `switch (store)`
				verifyExpression(node.discriminant);
			},
			'CallExpression, NewExpression'(node: TSESTree.CallExpression) {
				if (node.callee.type === 'Super') {
					return;
				}
				// Check for `store()`
				verifyExpression(node.callee, { allowCallable: node.type === 'CallExpression' });
			},
			UnaryExpression(node: TSESTree.UnaryExpression) {
				// Check for `-store`, `+store`, `!store`, `~store`, `typeof store`
				verifyExpression(node.argument, {
					consistent: node.operator === '!' || node.operator === 'typeof'
				});
			},
			'UpdateExpression, SpreadElement'(node: TSESTree.UpdateExpression | TSESTree.SpreadElement) {
				// Check for `store++`, `store--`, `...store`
				verifyExpression(node.argument);
			},
			AssignmentExpression(node: TSESTree.AssignmentExpression) {
				if (node.operator === '??=' || node.operator === '||=' || node.operator === '&&=') {
					if (node.operator === '??=' && isStoreExistenceCheck(node.left, node.right)) {
						// e.g. `ctx ??= readable(0)`
						return;
					}
					// Check for `store ||= foo`.
					// Don't fix it, since `$store ||= foo` sets the store value instead.
					verifyExpression(node.left, {
						disableFix: true,
						// Without type information, `consistent` means "declared with `const`",
						// but an assignment target is never `const`.
						consistent: hasTypeInfo
					});
					if (!isStore(node.left)) {
						// Check for `foo ||= store`.
						// If the left side is a store, assigning a store is fine.
						verifyExpression(node.right);
					}
				} else if (node.operator !== '=') {
					if (node.left.type !== 'ObjectPattern' && node.left.type !== 'ArrayPattern') {
						// Check for `store += 1`
						verifyExpression(node.left);
					}
					// Check for `foo += store`
					verifyExpression(node.right);
				}
			},
			BinaryExpression(node: TSESTree.BinaryExpression) {
				if (node.left.type !== 'PrivateIdentifier') {
					// Check for `store+1`
					verifyExpression(node.left, {
						consistent:
							node.operator === '==' ||
							node.operator === '!=' ||
							node.operator === '===' ||
							node.operator === '!=='
					});
				}
				// Check for `1+store`
				verifyExpression(node.right, {
					consistent:
						node.operator === '==' ||
						node.operator === '!=' ||
						node.operator === '===' ||
						node.operator === '!=='
				});
			},
			LogicalExpression(node: TSESTree.LogicalExpression) {
				if (node.operator === '??' && isStoreExistenceCheck(node.left, node.right)) {
					// e.g. `getContext('key') ?? readable(0)`
					return;
				}
				// Check for `store && foo`
				verifyExpression(node.left, {
					consistent: true
				});
			},
			TemplateLiteral(node: TSESTree.TemplateLiteral) {
				for (const expr of node.expressions) {
					// Check for `${store}`
					verifyExpression(expr);
				}
			},
			TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
				// Check for ` store`${foo}` `
				verifyExpression(node.tag, { allowCallable: true });
			},
			'Property, PropertyDefinition, MethodDefinition'(
				node: TSESTree.Property | TSESTree.PropertyDefinition | TSESTree.MethodDefinition
			) {
				if (node.key.type === 'PrivateIdentifier' || !node.computed) {
					return;
				}
				// Check for `{ [store]: foo}`
				verifyExpression(node.key);
			},
			ImportExpression(node: TSESTree.ImportExpression) {
				// Check for `import(store)`
				verifyExpression(node.source);
			},
			AwaitExpression(node: TSESTree.AwaitExpression) {
				// Check for `await store`
				verifyExpression(node.argument, {
					consistent: true
				});
			}
		};

		/**
		 * Checks whether `left ?? right` (or `left ??= right`) checks whether the store itself exists.
		 * e.g. `getContext('key') ?? readable(0)`
		 * This needs type information, because the type of the left side may not include `undefined`.
		 */
		function isStoreExistenceCheck(left: TSESTree.Expression, right: TSESTree.Expression) {
			return hasTypeInfo && isMaybeMissingStore(left) && isStore(left) && isStore(right);
		}

		/**
		 * Checks whether the given expression gets a store from a function call that may not return it,
		 * or is a variable initialized with such a call.
		 * e.g. `getContext('key')`, `const store = getContext('key')`
		 * `writable()`, `readable()`, and `derived()` always return a store, so they are excluded.
		 */
		function isMaybeMissingStore(node: TSESTree.Expression): boolean {
			const expr = unwrapNullishFallback(node);
			if (expr.type === 'Identifier') {
				const init = getInitializer(expr);
				return Boolean(init && isMaybeMissingStoreCall(init));
			}
			return isMaybeMissingStoreCall(expr);
		}

		/**
		 * Gets the initializer of the variable or the parameter default of the given identifier.
		 * e.g. `const store = init`, `function f(store = init) {}`
		 */
		function getInitializer(node: TSESTree.Identifier): TSESTree.Expression | null {
			const variable = findVariable(context, node);
			const def = variable?.defs.length === 1 ? variable.defs[0] : null;
			if (!def) {
				return null;
			}
			if (def.type === 'Variable') {
				return def.node.id.type === 'Identifier' ? def.node.init : null;
			}
			if (def.type === 'Parameter') {
				const parent = def.name.parent;
				return parent?.type === 'AssignmentPattern' && parent.left === def.name
					? parent.right
					: null;
			}
			return null;
		}

		/**
		 * Checks whether the given expression is a call other than `writable()`, `readable()`, and `derived()`.
		 */
		function isMaybeMissingStoreCall(node: TSESTree.Expression): boolean {
			let expr = unwrapNullishFallback(node);
			if (expr.type === 'AwaitExpression') {
				expr = unwrapTypeExpression(expr.argument);
			}
			if (expr.type === 'ChainExpression') {
				// e.g. `ctx?.get()`
				expr = expr.expression;
			}
			if (expr.type !== 'CallExpression') {
				return false;
			}
			if (!storeCreatorCalls) {
				storeCreatorCalls = new Set(Array.from(extractStoreReferences(context), (r) => r.node));
			}
			return !storeCreatorCalls.has(expr);
		}

		/**
		 * Gets the last operand of `??` chains, and removes TypeScript type expressions.
		 * e.g. `getContext('a') ?? getContext('b')` -> `getContext('b')`
		 */
		function unwrapNullishFallback(node: TSESTree.Expression): TSESTree.Expression {
			let expr = unwrapTypeExpression(node);
			while (expr.type === 'LogicalExpression' && expr.operator === '??') {
				expr = unwrapTypeExpression(expr.right);
			}
			return expr;
		}

		/**
		 * Removes TypeScript type expressions such as `as` and `!`.
		 */
		function unwrapTypeExpression(node: TSESTree.Expression): TSESTree.Expression {
			let expr = node;
			while (
				expr.type === 'TSAsExpression' ||
				expr.type === 'TSSatisfiesExpression' ||
				expr.type === 'TSNonNullExpression' ||
				expr.type === 'TSTypeAssertion'
			) {
				expr = expr.expression;
			}
			return expr;
		}

		/**
		 * Checks whether the given mustache node is the value of an event attribute.
		 * e.g. <button onclick={handler} />
		 */
		function isEventAttributeValue(node: AST.SvelteMustacheTag) {
			return (
				node.parent.type === 'SvelteAttribute' &&
				node.parent.value.length === 1 &&
				isEventAttributeName(node.parent.key.name)
			);
		}

		/**
		 * Checks whether the given attribute name is an event attribute name.
		 * Svelte 5 treats all attributes starting with `on` as event attributes.
		 */
		function isEventAttributeName(name: string) {
			return supportsEventAttributes && name.startsWith('on');
		}

		/**
		 * Checks whether the given script element is the module script.
		 * e.g. <script module>, <script context="module">
		 */
		function isModuleScript(node: AST.SvelteScriptElement) {
			if (findAttribute(node, 'module')) {
				return true;
			}
			const contextAttr = findAttribute(node, 'context');
			const contextValue = contextAttr?.value.length === 1 && contextAttr.value[0];
			return Boolean(
				contextValue && contextValue.type === 'SvelteLiteral' && contextValue.value === 'module'
			);
		}

		/**
		 * Checks whether the given mustache node accepts a store instance.
		 */
		function canAcceptStoreMustache(node: AST.SvelteMustacheTag) {
			if (node.parent.type !== 'SvelteAttribute') {
				// Text interpolation
				// e.g.
				// <p>{store}</p>
				// <input style:color={store} />
				return false;
			}
			const attr = node.parent;
			if (attr.value.length > 1) {
				// Template attribute value
				// e.g.
				// <Foo message="Hello {store}" />
				return false;
			}
			if (attr.key.name.startsWith('--')) {
				// --style-props
				// e.g.
				// <Foo --style-props={store} />
				return false;
			}
			const element = attr.parent.parent;
			return canAcceptStoreAttributeElement(element);
		}

		/**
		 * Checks whether the given element node accepts a store instance attribute.
		 */
		function canAcceptStoreAttributeElement(
			node: AST.SvelteElement | AST.SvelteScriptElement | AST.SvelteStyleElement
		) {
			if (node.type !== 'SvelteElement') {
				// Unknown. Within <script> or <style>
				return false;
			}
			if (
				node.kind === 'html' ||
				(node.kind === 'special' && node.name.name === 'svelte:element')
			) {
				// Native HTML attribute value
				// e.g.
				// <div data-message={store} />
				return false;
			}
			// Component props
			// e.g.
			// <Foo data={store} />
			// <Foo {store} />
			return true;
		}
	}
});
