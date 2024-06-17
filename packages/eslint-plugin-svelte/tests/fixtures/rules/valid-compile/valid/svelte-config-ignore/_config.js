/**
 * @typedef {import("svelte/compiler").Warning} Warning
 */
module.exports = {
	languageOptions: {
		parserOptions: {
			svelteConfig: {
				/**
				 * @param {Warning} warning
				 * @param {(warning: Warning) => void} handler
				 * @returns {void}
				 */
				onwarn(warning, handler) {
					if (
						warning.code === 'a11y_missing_attribute' ||
						warning.code === 'a11y-missing-attribute'
					)
						return;
					handler(warning);
				}
			}
		}
	}
};
