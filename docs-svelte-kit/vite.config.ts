import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import svelteMd from 'vite-plugin-svelte-md';
import { rules as pluginRules } from 'eslint-plugin-svelte';
import svelteMdOption from './tools/vite-plugin-svelte-md-option.mjs';

import generateRoutes from './tools/generate-routes.mjs';
import { createLogger, type UserConfig } from 'vite';
import { fileURLToPath } from 'url';

generateRoutes();

const dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = createLogger();

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
	define: {
		RULES_META: JSON.stringify(Object.values(pluginRules).map((rule) => ({ meta: rule.meta })))
	},
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
	},

	customLogger: {
		...logger,
		warn(msg, options) {
			if (msg.includes('vite-plugin-svelte-md') && msg.includes('was used to transform files')) {
				return;
			}
			logger.warn(msg, options);
		}
	}
};

export default config;
