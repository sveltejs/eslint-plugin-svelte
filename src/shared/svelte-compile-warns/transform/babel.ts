import type { AST } from 'svelte-eslint-parser';
import type babelCore from '@babel/core';
import type { RuleContext } from '../../../types';
import type { TransformResult } from './types';
import { loadModule } from '../../../utils/load-module';

type BabelCore = typeof babelCore;
/**
 * Transpile with babel
 */
export function transform(
	node: AST.SvelteScriptElement,
	text: string,
	context: RuleContext
): TransformResult | null {
	const babel = loadBabel(context);
	if (!babel) {
		return null;
	}
	let inputRange: AST.Range;
	if (node.endTag) {
		inputRange = [node.startTag.range[1], node.endTag.range[0]];
	} else {
		inputRange = [node.startTag.range[1], node.range[1]];
	}
	const code = text.slice(...inputRange);

	try {
		const output = babel.transformSync(code, {
			sourceType: 'module',
			sourceMaps: true,
			minified: false,
			ast: false,
			code: true,
			cwd: context.getCwd?.() ?? process.cwd()
		});
		if (!output) {
			return null;
		}
		return {
			inputRange,
			output: output.code!,
			mappings: output.map!.mappings
		};
	} catch (_e) {
		return null;
	}
}

/** Check if project has Babel. */
export function hasBabel(context: RuleContext): boolean {
	return Boolean(loadBabel(context));
}

/**
 * Load babel
 */
function loadBabel(context: RuleContext): BabelCore | null {
	return loadModule(context, '@babel/core');
}
