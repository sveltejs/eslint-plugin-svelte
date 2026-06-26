import fs from 'node:fs';
import path from 'node:path';
import type { UnpassedProp, buildAnalyzeInputSync, findNeverPassedProps } from 'svelte-shaker';
import { createRule } from '../utils/index.js';
import { loadModule } from '../utils/load-module.js';

/**
 * The slice of `svelte-shaker`'s API this rule needs. It is an OPTIONAL runtime
 * dependency, loaded from the user's project only when present, so we describe
 * just what we call rather than importing it eagerly.
 */
interface ShakerModule {
	buildAnalyzeInputSync: typeof buildAnalyzeInputSync;
	findNeverPassedProps: typeof findNeverPassedProps;
}

/**
 * Per-(cwd+options) whole-program scan result: absolute file path -> the props it
 * declares that no call site in the program passes. Computed once, lazily, then
 * reused for every file ESLint lints in the same run.
 */
const scanCache = new Map<string, Map<string, UnpassedProp[]>>();
let missingWarningShown = false;

export default createRule('no-useless-props', {
	meta: {
		docs: {
			description: 'disallow component props that no call site ever passes (whole-program, opt-in)',
			category: 'Best Practices',
			// Opt-in: needs a whole-program pre-scan and the optional `svelte-shaker`
			// dependency, so it is not part of the recommended preset.
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					// Directories (relative to the ESLint cwd) that contain the whole app —
					// every `.svelte` call site must be inside them for the analysis to be
					// sound (a missing site can only make the rule UNDER-report).
					include: {
						type: 'array',
						items: { type: 'string' }
					},
					// Import-prefix aliases, e.g. `{ "$lib": "src/lib" }` (the SvelteKit
					// default). Mapped to a directory relative to the cwd.
					aliases: {
						type: 'object',
						additionalProperties: { type: 'string' }
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			uselessProp:
				"'{{name}}' is declared but no call site in the project ever passes it, so it is always its default."
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		]
	},
	create(context) {
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte) return {};

		const shaker = loadModule<ShakerModule>(context, 'svelte-shaker');
		if (!shaker?.buildAnalyzeInputSync || !shaker.findNeverPassedProps) {
			if (!missingWarningShown) {
				missingWarningShown = true;
				// eslint-disable-next-line no-console -- a one-time notice that the opt-in rule is inert without its optional peer
				console.warn(
					'[svelte/no-useless-props] requires the optional `svelte-shaker` package ' +
						'(install it; needs Node >=22.12 for synchronous `require`). Rule skipped.'
				);
			}
			return {};
		}

		const cwd = context.cwd ?? process.cwd();
		const options = context.options[0] ?? {};
		const include: string[] = options.include ?? ['src'];
		const aliases: Record<string, string> = options.aliases ?? { $lib: 'src/lib' };

		const cacheKey = JSON.stringify({ cwd, include, aliases });
		let byFile = scanCache.get(cacheKey);
		if (!byFile) {
			byFile = scanProject(shaker, cwd, include, aliases);
			scanCache.set(cacheKey, byFile);
		}

		const filename = context.physicalFilename ?? context.filename;
		const unpassed = byFile.get(path.resolve(filename));
		if (!unpassed || unpassed.length === 0) return {};

		return {
			'Program:exit'() {
				const text = sourceCode.text;
				for (const prop of unpassed) {
					// Guard against drift between the on-disk text the scan read and the
					// text ESLint is linting (e.g. unsaved editor edits): only report when
					// the recorded span still spans this prop name.
					if (prop.end > text.length || !text.slice(prop.start, prop.end).includes(prop.name)) {
						continue;
					}
					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(prop.start),
							end: sourceCode.getLocFromIndex(prop.end)
						},
						messageId: 'uselessProp',
						data: { name: prop.name }
					});
				}
			}
		};
	}
});

/**
 * Run `svelte-shaker`'s whole-program analysis once over every `.svelte` file
 * under `include`, returning never-passed props keyed by absolute path. Any
 * failure (unreadable project, analysis throw) degrades to an empty map so the
 * rule never crashes a lint run.
 */
function scanProject(
	shaker: ShakerModule,
	cwd: string,
	include: string[],
	aliases: Record<string, string>
): Map<string, UnpassedProp[]> {
	try {
		const files = collectSvelteFiles(cwd, include);
		if (files.length === 0) return new Map();

		const aliasDirs = Object.entries(aliases).map(
			([prefix, dir]) => [prefix, path.resolve(cwd, dir)] as const
		);

		function resolve(source: string, importer: string): string | null {
			for (const [prefix, dir] of aliasDirs) {
				if (source === prefix || source.startsWith(`${prefix}/`)) {
					return path.join(dir, source.slice(prefix.length));
				}
			}
			if (source.startsWith('.')) return path.resolve(path.dirname(importer), source);
			return null; // bare specifier ($app, svelte, a node_modules package): not local
		}

		// Tolerant reader: a missing/broken import contributes an empty module rather
		// than aborting the whole scan.
		function readFile(id: string): string {
			try {
				return fs.readFileSync(id, 'utf8');
			} catch {
				return '';
			}
		}

		const input = shaker.buildAnalyzeInputSync(files, resolve, readFile);
		const byId = shaker.findNeverPassedProps(input);
		const out = new Map<string, UnpassedProp[]>();
		for (const [id, props] of byId) out.set(path.resolve(id), props);
		return out;
	} catch {
		return new Map();
	}
}

/** Every `.svelte` file under the `include` dirs (cwd-relative), skipping `node_modules`. */
function collectSvelteFiles(cwd: string, include: string[]): string[] {
	const out: string[] = [];
	for (const dir of include) {
		const root = path.resolve(cwd, dir);
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(root, { recursive: true, withFileTypes: true });
		} catch {
			continue; // dir does not exist — nothing to scan here
		}
		for (const entry of entries) {
			if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
			// `parentPath` (Node >=20.12) / `path` (older) holds the entry's directory.
			const parent = (entry as { parentPath?: string; path?: string }).parentPath ?? entry.path;
			if (!parent || parent.includes(`${path.sep}node_modules${path.sep}`)) continue;
			out.push(path.join(parent, entry.name));
		}
	}
	return out;
}
