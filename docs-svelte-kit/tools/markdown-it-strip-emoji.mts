import type Md from 'markdown-it';

/** Keep shortcode emoji out of the rendered docs without rewriting generated markdown. */
export default (md: Md): void => {
	md.renderer.rules.emoji = () => '';
};
