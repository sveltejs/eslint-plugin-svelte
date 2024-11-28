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
					// transform code
					handler({ ...warning, message: warning.message, code: 'foo' });
				}
			}
		}
	}
};
