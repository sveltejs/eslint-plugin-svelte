/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type { RuleListener, RuleContext, RuleModule } from '../types.js';
import type { TSESTree } from '@typescript-eslint/types';
import type { AST as SvAST } from 'svelte-eslint-parser';
import { Linter } from 'eslint';
import Module from 'module';

const require = Module.createRequire(import.meta.url);
/**
 * Define the wrapped core rule.
 */
export function defineWrapperListener(
	coreRule: RuleModule,
	context: RuleContext,
	proxyOptions: {
		createListenerProxy?: (listener: RuleListener) => RuleListener;
	}
): RuleListener {
	const listener = coreRule.create(context as any);

	const svelteListener = proxyOptions.createListenerProxy?.(listener) ?? listener;

	return svelteListener;
}

/**
 * Get the proxy node
 */
export function getProxyNode(node: { type: string }, properties: any): any {
	const cache: any = {};
	return new Proxy(node, {
		get(_t, key) {
			if (key in cache) {
				return cache[key];
			}
			if (key in properties) {
				return (cache[key] = properties[key]);
			}
			return (node as any)[key];
		}
	});
}

/**
 * Build the proxy rule listener
 */
export function buildProxyListener(
	base: RuleListener,
	convertNode: (
		node: SvAST.SvelteNode | (TSESTree.Node & { parent: SvAST.SvelteNode | TSESTree.Node | null })
	) => any
): RuleListener {
	const listeners: RuleListener = {};
	for (const [key, listener] of Object.entries(base)) {
		listeners[key] = function (...args: [any, any, any]) {
			(listener! as any).call(
				this,
				...args.map((arg) => {
					if (
						typeof arg === 'object' &&
						'type' in arg &&
						typeof arg.type === 'string' &&
						'range' in arg
					) {
						return convertNode(arg);
					}
					return arg;
				})
			);
		};
	}
	return listeners;
}

let ruleMap: Map<string, RuleModule> | null = null;

/**
 * Get the core rule implementation from the rule name
 */
export function getCoreRule(ruleName: string): RuleModule {
	try {
		const map: Map<string, RuleModule> = ruleMap
			? ruleMap
			: (ruleMap = (new Linter() as any).getRules());
		return map.get(ruleName)!;
	} catch {
		// getRules() is no longer available in flat config.
	}

	const { builtinRules } = require('eslint/use-at-your-own-risk');
	ruleMap = builtinRules;
	return builtinRules.get(ruleName) || null;
}
