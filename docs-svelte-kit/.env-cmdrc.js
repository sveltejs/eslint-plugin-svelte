'use strict';

module.exports = {
	sveltekit: {
		NODE_OPTIONS: `--import ./svelte-kit-import.mjs ${
			// eslint-disable-next-line no-process-env -- ignore
			process.env.NODE_OPTIONS || ''
		}`
	}
};
