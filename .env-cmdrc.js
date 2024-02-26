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
		NODE_OPTIONS: `--import ./svelte-kit-import.mjs ${
			// eslint-disable-next-line no-process-env -- ignore
			process.env.NODE_OPTIONS || ''
		}`
	}
};
