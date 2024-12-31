/**
 * @typedef {import("svelte/compiler").Warning} Warning
 */
module.exports = {
	languageOptions: {
		parserOptions: {
			svelteConfig: {
				warningFilter: (warning) => {
					return (
						warning.code !== 'a11y_missing_attribute' && warning.code !== 'a11y-missing-attribute'
					);
				}
			}
		}
	}
};
