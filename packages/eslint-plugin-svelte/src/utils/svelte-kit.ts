/**
 * refer: https://github.com/mysticatea/eslint-plugin-node/blob/f45c6149be7235c0f7422d1179c25726afeecd83/lib/util/get-package-json.js
 */

import type { RuleContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import { getPackageJson } from './get-package-json.js';
import { getFilename, getSourceCode } from './compat.js';

const isRunOnBrowser = !fs.readFileSync;

/**
 * return true if it's a SvelteKit page component.
 * @param context
 * @returns
 */
export function isKitPageComponent(context: RuleContext): boolean {
	// Hack: if it runs on browser, it regards as SvelteKit project.
	if (isRunOnBrowser) return true;
	if (!hasSvelteKit(getFilename(context))) return false;
	const routes =
		(
			context.settings?.svelte?.kit?.files?.routes ??
			getSourceCode(context).parserServices.svelteParseContext?.svelteConfig?.kit?.files?.routes
		)?.replace(/^\//, '') ?? 'src/routes';
	const filePath = getFilename(context);
	const projectRootDir = getProjectRootDir(getFilename(context)) ?? '';
	const fileName = path.basename(filePath);
	return (
		filePath.startsWith(path.join(projectRootDir, routes)) &&
		// MEMO: check only `+` and file extension for maintainability
		Boolean(/^\+.+\.svelte$/.test(fileName))
	);
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
