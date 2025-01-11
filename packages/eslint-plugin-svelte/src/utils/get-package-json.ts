/**
 * refer: https://github.com/mysticatea/eslint-plugin-node/blob/f45c6149be7235c0f7422d1179c25726afeecd83/lib/util/get-package-json.js
 */

import fs from 'fs';
import path from 'path';
import { createCache } from './cache.js';

type PackageJson = {
	name?: unknown;
	dependencies?: { [key in string]?: unknown };
	devDependencies?: { [key in string]?: unknown };
	filePath: string;
};

const isRunOnBrowser = !fs.readFileSync;
const packageJsonCache = createCache<PackageJson | null>();
const packageJsonsCache = createCache<PackageJson[]>();

/**
 * Reads the `package.json` data in a given path.
 *
 * Don't cache the data.
 *
 * @param dir The path to a directory to read.
 * @returns The read `package.json` data, or null.
 */
function readPackageJson(dir: string): PackageJson | null {
	if (isRunOnBrowser) return null;
	const filePath = path.join(dir, 'package.json');
	try {
		const text = fs.readFileSync(filePath, 'utf8');
		const data = JSON.parse(text);

		if (typeof data === 'object' && data !== null) {
			data.filePath = filePath;
			return data;
		}
	} catch {
		// do nothing.
	}

	return null;
}

/**
 * Gets a `package.json` data.
 * The data is cached if found, then it's used after.
 * @param startPath A file path to lookup.
 * @returns A found `package.json` data or `null`.
 *      This object have additional property `filePath`.
 */
export function getPackageJsons(startPath = 'a.js'): PackageJson[] {
	if (isRunOnBrowser) return [];

	const cached = packageJsonsCache.get(startPath);
	if (cached) {
		return cached;
	}

	const packageJsons: PackageJson[] = [];
	const startDir = path.dirname(path.resolve(startPath));
	let dir = startDir;
	let prevDir = '';
	let data = null;

	do {
		data = packageJsonCache.get(dir);
		if (data) {
			packageJsons.push(data);
		}

		data = readPackageJson(dir);
		if (data) {
			packageJsonCache.set(dir, data);
			packageJsons.push(data);
		}

		// Go to next.
		prevDir = dir;
		dir = path.resolve(dir, '..');
	} while (dir !== prevDir);

	packageJsonsCache.set(startDir, packageJsons);
	return packageJsons;
}
