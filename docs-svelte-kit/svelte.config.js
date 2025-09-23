import adapter from '@sveltejs/adapter-static';

if (typeof self === 'undefined') {
	globalThis.self = globalThis;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		preserveWhitespace: true,
		warningFilter: (warning) => {
			if (warning.code === 'a11y_no_noninteractive_tabindex') return false;
			return true;
		}
	},
	extensions: ['.svelte', '.md'],
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: '/eslint-plugin-svelte'
		}
	}
};
export default config;
