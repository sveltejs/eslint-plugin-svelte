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
			conflictOnComponent:
				'The module `{{moduleName}}` has the same name as this component. TypeScript resolves the import `{{specifier}}` to that module, not to this component. Rename `{{moduleName}}`.',
			conflictOnModule:
				'This module has the same name as the component `{{svelteName}}`. TypeScript resolves the import `{{specifier}}` to this module, not to the component. Rename this file.'
		},
		type: 'problem'
	},
	create(context) {
		const filename = context.physicalFilename;

		// Skip virtual/untitled files that do not exist on disk (editors, tests
		// with fake paths). Only real files on disk are checked.
		if (!isFile(filename)) {
			return {};
		}

		// Both sides of the collision are linted by this plugin, and a lint run
		// may contain only one of them, so each side reports on itself.
		if (filename.endsWith('.svelte')) {
			return {
				Program(node) {
					const svelteName = path.basename(filename);
					for (const ext of MODULE_EXTENSIONS) {
						const modulePath = `${filename}${ext}`;
						if (isFile(modulePath)) {
							context.report({
								node,
								loc: { line: 1, column: 0 },
								messageId: 'conflictOnComponent',
								data: {
									moduleName: realBasename(modulePath),
									specifier: `./${svelteName}`
								}
							});
							return;
						}
					}
				}
			};
		}

		// A module named `<name>.svelte.<ext>`. Dropping the extension gives the
		// component path it collides with. Declaration files such as
		// `Foo.svelte.d.ts` do not match, because dropping `.ts` leaves
		// `Foo.svelte.d`, which is not a component name.
		const moduleExt = MODULE_EXTENSIONS.find((ext) => filename.endsWith(ext));
		if (moduleExt == null) {
			return {};
		}
		const sveltePath = filename.slice(0, -moduleExt.length);
		if (!sveltePath.endsWith('.svelte') || !isFile(sveltePath)) {
			return {};
		}

		return {
			Program(node) {
				const svelteName = realBasename(sveltePath);
				context.report({
					node,
					loc: { line: 1, column: 0 },
					messageId: 'conflictOnModule',
					data: {
						svelteName,
						specifier: `./${svelteName}`
					}
				});
			}
		};
	}
});
