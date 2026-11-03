module.exports = {
	languageOptions: {
		parserOptions: {
			svelteConfig: {
				compilerOptions: {
					// Must be called with the real filename.
					runes: ({ filename }) => (filename.includes('svelte-config-runes-fn') ? false : true)
				}
			}
		}
	}
};
