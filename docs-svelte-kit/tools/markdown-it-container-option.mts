import type containerPlugin from 'markdown-it-container';
type ContainerPluginOption = Parameters<typeof containerPlugin>[2];
/**
 * Generate markdown-it-container option
 * @see https://github.com/markdown-it/markdown-it-container
 */
export default (type: string, defaultTitle = type.toUpperCase()): ContainerPluginOption => {
	return {
		render(tokens, index) {
			const token = tokens[index];

			if (token.nesting === 1) {
				// `before` tag

				// resolve info (title)
				let title = token.info.trim().slice(type.length).trim();

				if (!title) {
					title = defaultTitle;
				}
				// render
				if (type === 'details') {
					return `<details class="custom-block details">${
						title ? `<summary>${title}</summary>` : ''
					}\n`;
				}
				return `<div class="custom-block ${type}">${
					title ? `<p class="custom-block-title">${title}</p>` : ''
				}\n`;
			}
			// `after` tag
			// render
			if (type === 'details') {
				return `</details>\n`;
			}
			return '</div>\n';
		}
	};
};
