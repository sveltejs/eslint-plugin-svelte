module.exports = {
	languageOptions: {
		parserOptions: {
			svelteConfig: {
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				}
			}
		}
	}
};
