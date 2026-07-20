import fs from 'node:fs';
import path from 'node:path';
import { createRule } from '../utils/index.js';

// Extensions that plain TypeScript resolution appends to an unknown `.svelte`
// specifier. `.d.ts` is intentionally excluded: `Foo.svelte.d.ts` is a
// hand-written component declaration and does not shadow the component.
const MODULE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

function isFile(filePath: string): boolean {
	try {
		return fs.statSync(filePath).isFile();
	} catch {
		return false;
	}
}

// Resolve the real on-disk casing of a path's basename. On case-insensitive
// file systems (macOS, Windows) `fs.statSync` matches a differently-cased
// sibling, so the constructed name may not exist with that exact casing. Read
// the directory and use the actual entry name when one matches.
function realBasename(filePath: string): string {
	const wanted = path.basename(filePath);
	try {
		const entries = fs.readdirSync(path.dirname(filePath));
		return (
			entries.find((entry) => entry === wanted) ??
			entries.find((entry) => entry.toLowerCase() === wanted.toLowerCase()) ??
			wanted
		);
	} catch {
		return wanted;
	}
}

export default createRule('no-conflicting-module-names', {
	meta: {
		docs: {
			description:
				'disallow a `.svelte` component and a same-named runes module (e.g. `Foo.svelte` and `Foo.svelte.ts`) from coexisting',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {
			conflict:
				'Rename `{{conflictingName}}`. When it sits next to `{{svelteName}}`, TypeScript resolves the import `{{specifier}}` to the module instead of the component.'
		},
		type: 'problem'
	},
	create(context) {
		const filename = context.physicalFilename;

		// Skip virtual/untitled files that do not exist on disk (editors, tests
		// with fake paths). Only real `.svelte` component files are checked.
		if (!filename.endsWith('.svelte') || !isFile(filename)) {
			return {};
		}

		return {
			Program(node) {
				const svelteName = path.basename(filename);
				for (const ext of MODULE_EXTENSIONS) {
					const conflictingPath = `${filename}${ext}`;
					if (isFile(conflictingPath)) {
						context.report({
							node,
							loc: { line: 1, column: 0 },
							messageId: 'conflict',
							data: {
								conflictingName: realBasename(conflictingPath),
								svelteName,
								specifier: `./${svelteName}`
							}
						});
						return;
					}
				}
			}
		};
	}
});
