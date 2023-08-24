import type { AST } from 'svelte-eslint-parser';
import type stylus from 'stylus';
import type { RawSourceMap } from 'source-map-js';
import type { RuleContext } from '../../../types';
import type { TransformResult } from './types';
import { loadModule } from '../../../utils/load-module';

type Stylus = typeof stylus;
/**
 * Transpile with stylus
 */
export function transform(
	node: AST.SvelteStyleElement,
	text: string,
	context: RuleContext
): TransformResult | null {
	const stylus = loadStylus(context);
	if (!stylus) {
		return null;
	}
	let inputRange: AST.Range;
	if (node.endTag) {
		inputRange = [node.startTag.range[1], node.endTag.range[0]];
	} else {
		inputRange = [node.startTag.range[1], node.range[1]];
	}
	const code = text.slice(...inputRange);

	const filename = `${context.getFilename()}.stylus`;
	try {
		let output: string | undefined;

		const style = stylus(code, {
			filename
		}).set('sourcemap', {});
		style.render((_error, code) => {
			output = code;
		});
		if (output == null) {
			return null;
		}
		return {
			inputRange,
			output,
			mappings: (style as unknown as { sourcemap: RawSourceMap }).sourcemap.mappings
		};
	} catch (_e) {
		return null;
	}
}

/**
 * Load stylus
 */
function loadStylus(context: RuleContext): Stylus | null {
	return loadModule(context, 'stylus');
}
