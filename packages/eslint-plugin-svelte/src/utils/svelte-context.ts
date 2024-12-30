import type { RuleContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import { getPackageJson } from './get-package-json.js';
import { getFilename, getSourceCode } from './compat.js';

const isRunOnBrowser = !fs.readFileSync;

type FileType = '.svelte' | '.svelte.[js|ts]';
export type SvelteContext = {
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
} & (
	| {
			version: 3 | 4;
	  }
	| {
			version: 5;
			runes: boolean;
			fileType: FileType;
	  }
);

function getFileType(filePath: string): FileType | null {
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

function getSvelteKitFileType(context: RuleContext): SvelteContext['svelteKitFileType'] {
	const filePath = getFilename(context);

	// Hack: if it runs on browser, it regards as SvelteKit project.
	if (isRunOnBrowser) {
		return getSvelteKitFileTypeFromFilePath(filePath);
	}

	if (!hasSvelteKit(getFilename(context))) {
		return null;
	}

	const routes =
		(
			context.settings?.svelte?.kit?.files?.routes ??
			getSourceCode(context).parserServices.svelteParseContext?.svelteConfig?.kit?.files?.routes
		)?.replace(/^\//, '') ?? 'src/routes';
	const projectRootDir = getProjectRootDir(getFilename(context)) ?? '';

	if (!filePath.startsWith(path.join(projectRootDir, routes))) {
		return null;
	}

	return getSvelteKitFileTypeFromFilePath(filePath);
}

/**
 * Check givin file is under SvelteKit project.
 *
 * If it runs on browser, it always returns true.
 *
 * @param filePath A file path.
 * @returns
 */
function hasSvelteKit(filePath: string): boolean {
	// Hack: if it runs on browser, it regards as SvelteKit project.
	if (isRunOnBrowser) return true;
	try {
		const packageJson = getPackageJson(filePath);
		if (!packageJson) return false;
		if (packageJson.name === 'eslint-plugin-svelte')
			// Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
			// So always it returns true if it runs on the package.
			return true;
		return Boolean(
			packageJson.dependencies?.['@sveltejs/kit'] ?? packageJson.devDependencies?.['@sveltejs/kit']
		);
	} catch {
		return false;
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
	const svelteKitFileType = getSvelteKitFileType(context);

	if (compilerVersion.startsWith('3')) {
		return {
			version: 3,
			svelteKitFileType
		};
	}

	if (compilerVersion.startsWith('4')) {
		return {
			version: 4,
			svelteKitFileType
		};
	}

	const runes = svelteParseContext.runes === true;
	const fileType = getFileType(filePath);
	if (fileType === null) {
		return null;
	}

	return {
		version: 5,
		runes,
		fileType,
		svelteKitFileType
	};
}
