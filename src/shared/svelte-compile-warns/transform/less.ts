import type { AST } from 'svelte-eslint-parser';
import type less from 'less';
import type { RuleContext } from '../../../types';
import type { TransformResult } from './types';
import { loadModule } from '../../../utils/load-module';

type Less = typeof less;
/**
 * Transpile with less
 */
export function transform(
	node: AST.SvelteStyleElement,
	text: string,
	context: RuleContext
): TransformResult | null {
	const less = loadLess(context);
	if (!less) {
		return null;
	}
	let inputRange: AST.Range;
	if (node.endTag) {
		inputRange = [node.startTag.range[1], node.endTag.range[0]];
	} else {
		inputRange = [node.startTag.range[1], node.range[1]];
	}
	const code = text.slice(...inputRange);

	const filename = `${context.getFilename()}.less`;
	try {
		let output: Awaited<ReturnType<Less['render']>> | undefined;

		less.render(
			code,
			{
				sourceMap: {},
				syncImport: true,
				filename,
				lint: false
			},
			(_error, result) => {
				output = result;
			}
		);
		if (!output) {
			return null;
		}
		return {
			inputRange,
			output: output.css,
			mappings: JSON.parse(output.map).mappings
		};
	} catch (_e) {
		return null;
	}
}

/**
 * Load less
 */
function loadLess(context: RuleContext): Less | null {
	return loadModule(context, 'less');
}
