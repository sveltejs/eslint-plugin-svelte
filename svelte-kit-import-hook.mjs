/* !! This project can't be ESM yet, so hack it to get sveltekit to work. !! */
import babelCore from '@babel/core';
import * as t from '@babel/types';

/** transform code */
function transform(code, filename) {
	if (filename.includes('/@sveltejs/kit/') && code.includes('svelte.config.js')) {
		let transformed = false;
		const newCode = babelCore.transformSync(code, {
			babelrc: false,
			plugins: [
				{
					visitor: {
						StringLiteral(path) {
							if (path.node.value === 'svelte.config.js') {
								// The configuration file loads `svelte.config.mjs`.
								path.replaceWith(t.stringLiteral('svelte.config.mjs'));
								transformed = true;
							}
						}
					}
				}
			]
		});
		if (!transformed) {
			return code;
		}
		return `${newCode.code}`;
	}

	return code;
}

/**
 * @param {string} url
 * @param {{
 *   format: string,
 * }} context If resolve settled with a `format`, that value is included here.
 * @param {Function} defaultLoad
 * @returns {Promise<{
 * format: !string,
 * source: !(string | ArrayBuffer | SharedArrayBuffer | Uint8Array),
 * }>}
 */
export async function load(url, context, defaultLoad) {
	const result = await defaultLoad(url, context, defaultLoad);
	return {
		format: result.format,
		source: transform(`${result.source}`, url)
	};
}

/**
 * @param {!(string | SharedArrayBuffer | Uint8Array)} source
 * @param {{
 *   format: string,
 *   url: string,
 * }} context
 * @param {Function} defaultTransformSource
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array) }>}
 */
export async function transformSource(source, context, defaultTransformSource) {
	const result = await defaultTransformSource(source, context, defaultTransformSource);
	return {
		source: transform(`${result.source}`, context.url)
	};
}
