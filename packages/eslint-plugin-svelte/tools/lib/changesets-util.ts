import getReleasePlan from '@changesets/get-release-plan';
import { fileURLToPath } from 'url';

const cwdURL = new URL('../../../..', import.meta.url);

/** Get new version string from changesets */
export async function getNewVersion(): Promise<string> {
	const releasePlan = await getReleasePlan(fileURLToPath(cwdURL));

	return releasePlan.releases.find(({ name }) => name === 'eslint-plugin-svelte')!.newVersion;
}
