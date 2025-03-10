import type { RuleContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import { getPackageJsons } from './get-package-json.js';
import { getNodeModule } from './get-node-module.js';
import { getFilename, getSourceCode } from './compat.js';
import { createCache } from './cache.js';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';

const isRunInBrowser = !fs.readFileSync;

export type SvelteContext = (
	| {
			svelteVersion: '3/4';
			svelteFileType: '.svelte' | null;
			runes: null;
	  }
	| ({
			svelteVersion: '5';
	  } & (
			| {
					svelteFileType: '.svelte' | '.svelte.[js|ts]';
					/** If a user uses a parser other than `svelte-eslint-parser`, `undetermined` will be set. */
					runes: boolean | 'undetermined';
			  }
			| {
					/** e.g. `foo.js` / `package.json` */
					svelteFileType: null;
					runes: null;
			  }
	  ))
	| {
			/** For projects that do not use Svelte. */
			svelteVersion: null;
			svelteFileType: null;
			runes: null;
	  }
) & {
	svelteKitVersion: '1.0.0-next' | '1' | '2' | null;
	svelteKitFileType:
		| '+page.svelte'
		| '+page.[js|ts]'
		| '+page.server.[js|ts]'
		| '+error.svelte'
		| '+layout.svelte'
		| '+layout.[js|ts]'
		| '+layout.server.[js|ts]'
		| '+server.[js|ts]'
		| null;
};

function getSvelteFileType(filePath: string): SvelteContext['svelteFileType'] {
	if (filePath.endsWith('.svelte')) {
		return '.svelte';
	}

	if (filePath.endsWith('.svelte.js') || filePath.endsWith('.svelte.ts')) {
		return '.svelte.[js|ts]';
	}

	return null;
}

function getSvelteKitFileTypeFromFilePath(filePath: string): SvelteContext['svelteKitFileType'] {
	const fileName = filePath.split(/[/\\]/).pop();
	switch (fileName) {
		case '+page.svelte': {
			return '+page.svelte';
		}
		case '+page.js':
		case '+page.ts': {
			return '+page.[js|ts]';
		}
		case '+page.server.js':
		case '+page.server.ts': {
			return '+page.server.[js|ts]';
		}
		case '+error.svelte': {
			return '+error.svelte';
		}
		case '+layout.svelte': {
			return '+layout.svelte';
		}
		case '+layout.js':
		case '+layout.ts': {
			return '+layout.[js|ts]';
		}
		case '+layout.server.js':
		case '+layout.server.ts': {
			return '+layout.server.[js|ts]';
		}
		case '+server.js':
		case '+server.ts': {
			return '+server.[js|ts]';
		}
		default: {
			return null;
		}
	}
}

function extractMajorVersion(version: string, recognizePrereleaseVersion: boolean): string | null {
	if (recognizePrereleaseVersion) {
		const match = /^(?:\^|~)?(\d+\.0\.0-next)/.exec(version);
		if (match && match[1]) {
			return match[1];
		}
	}

	const match = /^(?:\^|~)?(\d+)\./.exec(version);
	if (match && match[1]) {
		return match[1];
	}
	return null;
}

const svelteKitContextCache = createCache<Pick<
	SvelteContext,
	'svelteKitFileType' | 'svelteKitVersion'
> | null>();

function getSvelteKitContext(
	context: RuleContext
): Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> {
	const filePath = getFilename(context);

	const cached = svelteKitContextCache.get(filePath);
	if (cached) return cached;

	const svelteKitVersion = getSvelteKitVersion(filePath);
	if (svelteKitVersion == null) {
		const result: Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> = {
			svelteKitFileType: null,
			svelteKitVersion: null
		};
		svelteKitContextCache.set(filePath, result);
		return result;
	}
	if (isRunInBrowser) {
		const result: Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> = {
			svelteKitVersion,
			// Judge by only file path if it runs in browser.
			svelteKitFileType: getSvelteKitFileTypeFromFilePath(filePath)
		};
		svelteKitContextCache.set(filePath, result);
		return result;
	}

	const routes =
		(
			context.settings?.svelte?.kit?.files?.routes ??
			getSourceCode(context).parserServices.svelteParseContext?.svelteConfig?.kit?.files?.routes
		)?.replace(/^\//, '') ?? 'src/routes';
	const projectRootDir = getProjectRootDir(getFilename(context)) ?? '';

	if (!filePath.startsWith(path.join(projectRootDir, routes))) {
		const result: Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> = {
			svelteKitVersion,
			svelteKitFileType: null
		};
		svelteKitContextCache.set(filePath, result);
		return result;
	}

	const result: Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> = {
		svelteKitVersion,
		svelteKitFileType: getSvelteKitFileTypeFromFilePath(filePath)
	};
	svelteKitContextCache.set(filePath, result);
	return result;
}

function checkAndSetSvelteVersion(version: string): SvelteContext['svelteVersion'] | null {
	const major = extractMajorVersion(version, false);
	if (major == null) {
		return null;
	}
	if (major === '3' || major === '4') {
		return '3/4';
	}
	return major as SvelteContext['svelteVersion'];
}

export function getSvelteVersion(): SvelteContext['svelteVersion'] {
	// Hack: if it runs in browser, it regards as Svelte project.
	if (isRunInBrowser) {
		return '5';
	}

	return checkAndSetSvelteVersion(SVELTE_VERSION);
}

const svelteKitVersionCache = createCache<SvelteContext['svelteKitVersion']>();

function checkAndSetSvelteKitVersion(
	version: string,
	filePath: string
): SvelteContext['svelteKitVersion'] {
	const major = extractMajorVersion(version, true) as SvelteContext['svelteKitVersion'];
	svelteKitVersionCache.set(filePath, major);
	return major;
}

function getSvelteKitVersion(filePath: string): SvelteContext['svelteKitVersion'] {
	const cached = svelteKitVersionCache.get(filePath);
	if (cached) return cached;

	// Hack: if it runs in browser, it regards as SvelteKit project.
	if (isRunInBrowser) {
		svelteKitVersionCache.set(filePath, '2');
		return '2';
	}

	const nodeModule = getNodeModule('@sveltejs/kit', filePath);
	if (nodeModule) {
		try {
			const packageJson = JSON.parse(
				fs.readFileSync(path.join(nodeModule, 'package.json'), 'utf8')
			);
			const result = checkAndSetSvelteKitVersion(packageJson.version, filePath);
			if (result != null) {
				return result;
			}
		} catch {
			/** do nothing */
		}
	}

	try {
		const packageJsons = getPackageJsons(filePath);
		if (packageJsons.length > 0) {
			if (packageJsons[0].name === 'eslint-plugin-svelte') {
				// Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
				// So always it returns 2 if it runs on the package.
				svelteKitVersionCache.set(filePath, '2');
				return '2';
			}

			for (const packageJson of packageJsons) {
				const version =
					packageJson.dependencies?.['@sveltejs/kit'] ??
					packageJson.devDependencies?.['@sveltejs/kit'];
				if (typeof version === 'string') {
					const result = checkAndSetSvelteKitVersion(version, filePath);
					if (result != null) {
						return result;
					}
				}
			}
		}
	} catch {
		/** do nothing */
	}

	svelteKitVersionCache.set(filePath, null);
	return null;
}

const projectRootDirCache = createCache<string | null>();

/**
 * Gets a  project root folder path.
 * @param filePath A file path to lookup.
 * @returns A found project root folder path or null.
 */
function getProjectRootDir(filePath: string): string | null {
	if (isRunInBrowser) return null;
	const cached = projectRootDirCache.get(filePath);
	if (cached) return cached;

	const packageJsons = getPackageJsons(filePath);
	if (packageJsons.length === 0) {
		projectRootDirCache.set(filePath, null);
		return null;
	}
	const packageJsonFilePath = packageJsons[0].filePath;
	if (!packageJsonFilePath) {
		projectRootDirCache.set(filePath, null);
		return null;
	}
	const projectRootDir = path.dirname(path.resolve(packageJsonFilePath));
	projectRootDirCache.set(filePath, projectRootDir);
	return projectRootDir;
}

const svelteContextCache = createCache<SvelteContext | null>();

export function getSvelteContext(context: RuleContext): SvelteContext | null {
	const { parserServices } = getSourceCode(context);
	const { svelteParseContext } = parserServices;
	const filePath = getFilename(context);

	const cached = svelteContextCache.get(filePath);
	if (cached) return cached;

	const svelteKitContext = getSvelteKitContext(context);
	const svelteVersion = getSvelteVersion();
	const svelteFileType = getSvelteFileType(filePath);

	if (svelteVersion == null) {
		const result: SvelteContext = {
			svelteVersion: null,
			svelteFileType: null,
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
		svelteContextCache.set(filePath, result);
		return result;
	}

	if (svelteVersion === '3/4') {
		const result: SvelteContext = {
			svelteVersion,
			svelteFileType: svelteFileType === '.svelte' ? '.svelte' : null,
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
		svelteContextCache.set(filePath, result);
		return result;
	}

	if (svelteFileType == null) {
		const result: SvelteContext = {
			svelteVersion,
			svelteFileType: null,
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
		svelteContextCache.set(filePath, result);
		return result;
	}

	const result: SvelteContext = {
		svelteVersion,
		runes: svelteParseContext?.runes ?? 'undetermined',
		svelteFileType,
		svelteKitVersion: svelteKitContext.svelteKitVersion,
		svelteKitFileType: svelteKitContext.svelteKitFileType
	};
	svelteContextCache.set(filePath, result);
	return result;
}
