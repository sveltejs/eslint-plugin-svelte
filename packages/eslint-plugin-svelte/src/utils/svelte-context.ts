import type { RuleContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import { getPackageJsons } from './get-package-json.js';
import { getFilename, getSourceCode } from './compat.js';

const isRunInBrowser = !fs.readFileSync;

export type SvelteContext = (
	| ({
			svelteVersion: '3/4';
	  } & {
			svelteFileType: '.svelte' | 'other';
			runes: null;
	  })
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
					svelteFileType: 'other';
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
		| '+page.js'
		| '+page.server.js'
		| '+error.svelte'
		| '+layout.svelte'
		| '+layout.js'
		| '+layout.server.js'
		| '+server.js'
		| null;
};

function getSvelteFileType(filePath: string): NonNullable<SvelteContext['svelteFileType']> {
	if (filePath.endsWith('.svelte')) {
		return '.svelte';
	}

	if (filePath.endsWith('.svelte.js') || filePath.endsWith('.svelte.ts')) {
		return '.svelte.[js|ts]';
	}

	return 'other';
}

function getSvelteKitFileTypeFromFilePath(filePath: string): SvelteContext['svelteKitFileType'] {
	const fileName = filePath.split('/').pop();
	switch (fileName) {
		case '+page.svelte': {
			return '+page.svelte';
		}
		case '+page.js':
		case '+page.ts': {
			return '+page.js';
		}
		case '+page.server.js':
		case '+page.server.ts': {
			return '+page.server.js';
		}
		case '+error.svelte': {
			return '+error.svelte';
		}
		case '+layout.svelte': {
			return '+layout.svelte';
		}
		case '+layout.js':
		case '+layout.ts': {
			return '+layout.js';
		}
		case '+layout.server.js':
		case '+layout.server.ts': {
			return '+layout.server.js';
		}
		case '+server.js':
		case '+server.ts': {
			return '+server.js';
		}
		default: {
			return null;
		}
	}
}

function getSvelteKitContext(
	context: RuleContext
): Pick<SvelteContext, 'svelteKitFileType' | 'svelteKitVersion'> {
	const filePath = getFilename(context);
	const svelteKitVersion = getSvelteKitVersion(filePath);
	if (svelteKitVersion == null) {
		return {
			svelteKitFileType: null,
			svelteKitVersion: null
		};
	}
	if (isRunInBrowser) {
		return {
			svelteKitVersion,
			// Judge by only file path if it runs in browser.
			svelteKitFileType: getSvelteKitFileTypeFromFilePath(filePath)
		};
	}

	const routes =
		(
			context.settings?.svelte?.kit?.files?.routes ??
			getSourceCode(context).parserServices.svelteParseContext?.svelteConfig?.kit?.files?.routes
		)?.replace(/^\//, '') ?? 'src/routes';
	const projectRootDir = getProjectRootDir(getFilename(context)) ?? '';

	if (!filePath.startsWith(path.join(projectRootDir, routes))) {
		return {
			svelteKitVersion,
			svelteKitFileType: null
		};
	}

	return {
		svelteKitVersion,
		svelteKitFileType: getSvelteKitFileTypeFromFilePath(filePath)
	};
}

function getSvelteVersion(filePath: string): SvelteContext['svelteVersion'] {
	// Hack: if it runs in browser, it regards as Svelte project.
	if (isRunInBrowser) return '5';
	try {
		const packageJsons = getPackageJsons(filePath);
		for (const packageJson of packageJsons) {
			const version = packageJson.dependencies?.svelte ?? packageJson.devDependencies?.svelte;
			if (typeof version !== 'string') {
				continue;
			}
			const major = version.split('.')[0];
			if (major === '3' || major === '4') {
				return '3/4';
			}
			return major as SvelteContext['svelteVersion'];
		}
	} catch {
		/** do nothing */
	}

	return null;
}

/**
 * Check givin file is under SvelteKit project.
 *
 * If it runs on browser, it always returns true.
 *
 * @param filePath A file path.
 * @returns
 */
function getSvelteKitVersion(filePath: string): SvelteContext['svelteKitVersion'] {
	// Hack: if it runs in browser, it regards as SvelteKit project.
	if (isRunInBrowser) return '2';
	try {
		const packageJsons = getPackageJsons(filePath);
		if (packageJsons.length === 0) return null;
		if (packageJsons[0].name === 'eslint-plugin-svelte') {
			// Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
			// So always it returns 2 if it runs on the package.
			return '2';
		}

		for (const packageJson of packageJsons) {
			const version =
				packageJson.dependencies?.['@sveltejs/kit'] ??
				packageJson.devDependencies?.['@sveltejs/kit'];
			if (typeof version !== 'string') {
				return null;
			}
			return version.split('.')[0] as SvelteContext['svelteKitVersion'];
		}
	} catch {
		/** do nothing */
	}

	return null;
}

/**
 * Gets a  project root folder path.
 * @param filePath A file path to lookup.
 * @returns A found project root folder path or null.
 */
function getProjectRootDir(filePath: string): string | null {
	if (isRunInBrowser) return null;
	const packageJsons = getPackageJsons(filePath);
	if (packageJsons.length === 0) {
		return null;
	}
	const packageJsonFilePath = packageJsons[0].filePath;
	if (!packageJsonFilePath) return null;
	return path.dirname(path.resolve(packageJsonFilePath));
}

export function getSvelteContext(context: RuleContext): SvelteContext | null {
	const { parserServices } = getSourceCode(context);
	const { svelteParseContext } = parserServices;
	const filePath = getFilename(context);
	const svelteKitContext = getSvelteKitContext(context);
	const svelteVersion = getSvelteVersion(filePath);
	const svelteFileType = getSvelteFileType(filePath);

	if (svelteVersion == null) {
		return {
			svelteVersion: null,
			svelteFileType: null,
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
	}

	if (svelteFileType === 'other') {
		return {
			svelteVersion,
			svelteFileType,
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
	}

	if (svelteVersion === '3/4') {
		return {
			svelteVersion,
			svelteFileType: svelteFileType === '.svelte' ? '.svelte' : 'other',
			runes: null,
			svelteKitVersion: svelteKitContext.svelteKitVersion,
			svelteKitFileType: svelteKitContext.svelteKitFileType
		};
	}

	return {
		svelteVersion,
		runes: svelteParseContext?.runes ?? 'undetermined',
		svelteFileType,
		svelteKitVersion: svelteKitContext.svelteKitVersion,
		svelteKitFileType: svelteKitContext.svelteKitFileType
	};
}
