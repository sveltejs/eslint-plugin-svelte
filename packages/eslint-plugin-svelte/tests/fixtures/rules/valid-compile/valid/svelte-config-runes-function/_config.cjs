module.exports = {
	languageOptions: {
		parserOptions: {
			svelteConfig: {
				compilerOptions: {
					// Runes mode is only disabled for `legacy-input.svelte`.
					runes: ({ filename }) => !filename.endsWith('legacy-input.svelte')
				}
			}
		}
	}
};
