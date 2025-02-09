import fs from 'fs';
import path from 'path';
import { createCache } from './cache.js';

const isRunOnBrowser = !fs.readFileSync;
const nodeModuleCache = createCache<string | null>();
const nodeModulesCache = createCache<string[]>();

/**
 * Find package directory in node_modules
 */
function findPackageInNodeModules(dir: string, packageName: string): string | null {
	if (isRunOnBrowser) return null;

	const nodeModulesPath = path.join(dir, 'node_modules');
	const packagePath = path.join(nodeModulesPath, packageName);

	try {
		const stats = fs.statSync(packagePath);
		if (stats.isDirectory()) {
			return packagePath;
		}
	} catch {
		// ignore if directory not found
	}

	return null;
}

/**
 * Get first found package path from node_modules
 */
export function getNodeModule(packageName: string, startPath = 'a.js'): string | null {
	if (isRunOnBrowser) return null;

	const cacheKey = `${startPath}:${packageName}`;
	const cached = nodeModulesCache.get(cacheKey);
	if (cached) {
		return cached[0] ?? null;
	}

	const startDir = path.dirname(path.resolve(startPath));
	let dir = startDir;
	let prevDir = '';

	do {
		// check cache
		const cachePath = nodeModuleCache.get(`${dir}:${packageName}`);
		if (cachePath) {
			if (cachePath !== null) {
				nodeModulesCache.set(cacheKey, [cachePath]);
				return cachePath;
			}
		} else {
			// search new
			const packagePath = findPackageInNodeModules(dir, packageName);
			nodeModuleCache.set(`${dir}:${packageName}`, packagePath);
			if (packagePath) {
				nodeModulesCache.set(cacheKey, [packagePath]);
				return packagePath;
			}
		}

		// go to parent
		prevDir = dir;
		dir = path.resolve(dir, '..');
	} while (dir !== prevDir);

	nodeModulesCache.set(cacheKey, []);
	return null;
}
