import type { AST } from 'svelte-eslint-parser';
import { createSyncFn } from 'synckit';

import type { RuleContext } from '../../../types';
import { getCwd, getFilename } from '../../../utils/compat';
import type { TransformResult } from './types';

const postcssProcess = createSyncFn(require.resolve('./postcss.worker')) as (options: {
	cwd: string;
	filename: string;
	code: string;
	configFilePath?: unknown;
}) => {
	output: string;
	mappings: string;
};

/**
 * Transform with postcss
 */
export function transform(
	node: AST.SvelteStyleElement,
	text: string,
	context: RuleContext
): TransformResult | null {
	const postcssConfig = context.settings?.svelte?.compileOptions?.postcss;
	if (postcssConfig === false) {
		return null;
	}
	let inputRange: AST.Range;
	if (node.endTag) {
		inputRange = [node.startTag.range[1], node.endTag.range[0]];
	} else {
		inputRange = [node.startTag.range[1], node.range[1]];
	}
	const code = text.slice(...inputRange);
	const filename = `${getFilename(context)}.css`;

	try {
		const configFilePath = postcssConfig?.configFilePath;

		const result = postcssProcess({
			cwd: getCwd(context),
			filename,
			code,
			configFilePath
		});

		return {
			inputRange,
			...result
		};
	} catch (_e) {
		// console.error(_e);
		return null;
	}
}
