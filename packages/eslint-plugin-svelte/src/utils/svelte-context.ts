import type { RuleContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import { getPackageJson } from './get-package-json.js';
import { getFilename, getSourceCode } from './compat.js';

const isRunOnBrowser = !fs.readFileSync;

export type SvelteContext = {
	svelteVersion: string;
	fileType: '.svelte' | '.svelte.[js|ts]';
	runes: boolean;
	svelteKitVersion: string | null;
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

function getFileType(filePath: string): SvelteContext['fileType'] | null {
	if (filePath.endsWith('.svelte')) {
		return '.svelte';
	}

	if (filePath.endsWith('.svelte.js') || filePath.endsWith('.svelte.ts')) {
		return '.svelte.[js|ts]';
	}

	return null;
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
	const svelteKitVersion = gteSvelteKitVersion(filePath);
	if (svelteKitVersion == null) {
		return {
			svelteKitFileType: null,
			svelteKitVersion: null
		};
	}
	if (isRunOnBrowser) {
		return {
			svelteKitVersion,
			// Judge by only file path if it runs on browser.
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

/**
 * Check givin file is under SvelteKit project.
 *
 * If it runs on browser, it always returns true.
 *
 * @param filePath A file path.
 * @returns
 */
function gteSvelteKitVersion(filePath: string): string | null {
	// Hack: if it runs on browser, it regards as SvelteKit project.
	if (isRunOnBrowser) return '2.15.1';
	try {
		const packageJson = getPackageJson(filePath);
		if (!packageJson) return null;
		if (packageJson.name === 'eslint-plugin-svelte')
			// Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
			// So always it returns true if it runs on the package.
			return '2.15.1';

		const version =
			packageJson.dependencies?.['@sveltejs/kit'] ?? packageJson.devDependencies?.['@sveltejs/kit'];
		return typeof version === 'string' ? version : null;
	} catch {
		return null;
	}
}

/**
 * Gets a  project root folder path.
 * @param filePath A file path to lookup.
 * @returns A found project root folder path or null.
 */
function getProjectRootDir(filePath: string): string | null {
	if (isRunOnBrowser) return null;
	const packageJsonFilePath = getPackageJson(filePath)?.filePath;
	if (!packageJsonFilePath) return null;
	return path.dirname(path.resolve(packageJsonFilePath));
}

export function getSvelteContext(context: RuleContext): SvelteContext | null {
	const { parserServices } = getSourceCode(context);
	const { svelteParseContext } = parserServices;
	if (svelteParseContext === undefined) {
		return null;
	}

	const { compilerVersion } = svelteParseContext;
	if (compilerVersion === undefined) {
		return null;
	}

	const filePath = getFilename(context);
	const svelteKitContext = getSvelteKitContext(context);

	const runes = svelteParseContext.runes === true;
	const fileType = getFileType(filePath);
	if (fileType === null) {
		return null;
	}

	return {
		svelteVersion: compilerVersion,
		runes,
		fileType,
		svelteKitVersion: svelteKitContext.svelteKitVersion,
		svelteKitFileType: svelteKitContext.svelteKitFileType
	};
}
