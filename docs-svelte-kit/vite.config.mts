import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
// @ts-expect-error -- Missing types
import svelteMd from 'vite-plugin-svelte-md';
import svelteMdOption from './tools/vite-plugin-svelte-md-option.mjs';

import generateRoutes from './tools/generate-routes.mjs';
import generateRulesMeta from './tools/generate-rules-meta.mjs';
import type { UserConfig } from 'vite';
import { fileURLToPath } from 'url';

generateRoutes();
generateRulesMeta();

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('vite').UserConfig} */
const config: UserConfig = {
	plugins: [
		svelteMd(
			svelteMdOption({
				baseUrl: '/eslint-plugin-svelte',
				root: path.join(dirname, '../docs')
			})
		),
		sveltekit()
	],
	ssr: {
		// vite-plugin-svelte recognizes svelte-eslint-parser as a library that runs on svelte.
		// This confuses the SSR on the Dev server.
		// This is the workaround for that.
		// https://github.com/sveltejs/vite-plugin-svelte/blob/a1d141e890ac0d1572a46e2bec705aa090236560/packages/vite-plugin-svelte/src/utils/dependencies.ts#L114
		external: ['svelte-eslint-parser']
	},
	build: {
		commonjsOptions: {
			ignoreDynamicRequires: true
		}
	}
};

export default config;
