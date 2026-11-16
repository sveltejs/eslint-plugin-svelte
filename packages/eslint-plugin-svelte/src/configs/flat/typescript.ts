import Module from 'module';
import type { Linter } from 'eslint';
import base from './base.js';

const require = Module.createRequire(import.meta.url);

function loadTypeScriptParser(): unknown {
	for (const [name, pick] of [
		['typescript-eslint', (m: { parser: unknown }) => m.parser],
		['@typescript-eslint/parser', (m: unknown) => m]
	] as const) {
		try {
			return pick(require(name));
		} catch {
			// Try the next one.
		}
	}
	throw new Error(
		'`svelte.configs.typescript` requires `typescript-eslint` or `@typescript-eslint/parser` to be installed.'
	);
}

/**
 * Created lazily, so the TypeScript parser is only required when this config is used.
 */
export function createTypeScriptConfig(): Linter.Config[] {
	return [
		...base,
		{
			name: 'svelte:typescript:setup',
			files: [
				'*.svelte',
				'**/*.svelte',
				'*.svelte.ts',
				'**/*.svelte.ts',
				'*.svelte.js',
				'**/*.svelte.js'
			],
			languageOptions: {
				parserOptions: {
					// Enable TypeScript parsing for `.svelte`, `.svelte.ts` and `.svelte.js` files.
					parser: loadTypeScriptParser()
				}
			}
		},
		{
			name: 'svelte:typescript:extra-file-extensions',
			languageOptions: {
				parserOptions: {
					// Keep this consistent for TypeScript and Svelte files to avoid project reloads.
					extraFileExtensions: ['.svelte']
				}
			}
		}
	];
}
