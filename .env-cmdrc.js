'use strict';

module.exports = {
	version: {
		IN_VERSION_SCRIPT: 'true'
	},
	'version-ci': {
		IN_VERSION_CI_SCRIPT: 'true'
	},
	debug: {
		DEBUG: 'eslint-plugin-svelte*'
	},
	'update-fixtures': {
		UPDATE_FIXTURES: 'true'
	},
	sveltekit: {
		NODE_OPTIONS: `--experimental-loader ./svelte-kit-import-hook.mjs ${
			// eslint-disable-next-line no-process-env -- ignore
			process.env.NODE_OPTIONS || ''
		}`
	},
	synckit: {
		SYNCKIT_TIMEOUT: 1000,
		SYNCKIT_TS_RUNNER: 'esbuild-register'
	}
};
