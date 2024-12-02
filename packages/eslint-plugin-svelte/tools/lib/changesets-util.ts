import getReleasePlan from '@changesets/get-release-plan';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/** Get new version string from changesets */
export async function getNewVersion(): Promise<string> {
	const releasePlan = await getReleasePlan(path.resolve(__dirname, '../../../..'));

	return releasePlan.releases.find(({ name }) => name === 'eslint-plugin-svelte')!.newVersion;
}
