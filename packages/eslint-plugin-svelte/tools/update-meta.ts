import { name, version } from '../package.json';
import { getNewVersion } from './lib/changesets-util.js';
import { writeAndFormat } from './lib/write.js';

const META_URL = new URL('../src/meta.ts', import.meta.url);

void main();

/** main */
async function main() {
	await writeAndFormat(
		META_URL,
		`/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
export const name = ${JSON.stringify(name)} as const;
export const version = ${JSON.stringify(await getVersion())} as const;
`
	);
}

/** Get version */
function getVersion() {
	// eslint-disable-next-line no-process-env -- ignore
	if (process.env.IN_VERSION_CI_SCRIPT) {
		return getNewVersion();
	}
	return version;
}
