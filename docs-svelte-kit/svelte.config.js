import ghpagesAdapter from 'svelte-adapter-ghpages';
import path from 'path';
import { fileURLToPath } from 'url';

if (typeof self === 'undefined') {
	globalThis.self = globalThis;
}

const dirname = path.dirname(fileURLToPath(import.meta.url));

const outDir = path.join(dirname, 'build/eslint-plugin-svelte');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		preserveWhitespace: true
	},
	extensions: ['.svelte', '.md'],
	kit: {
		paths: {
			base: '/eslint-plugin-svelte',
			relative: false
		},
		adapter: ghpagesAdapter({
			// default options are shown
			pages: outDir,
			assets: outDir
		}),
		files: {
			routes: path.join(dirname, './src/routes'),
			appTemplate: path.join(dirname, './src/app.html'),
			hooks: {
				server: path.join(dirname, './src/hooks/server'),
				client: path.join(dirname, './src/hooks/client')
			},
			lib: path.join(dirname, './src/lib'),
			assets: path.join(dirname, './statics')
		}
	}
};
export default config;
