import highlight from './highlight.mjs';
import replaceLinkPlugin from './markdown-it-replace-link.mjs';
import { full as emojiPlugin } from 'markdown-it-emoji';
import anchorPlugin from 'markdown-it-anchor';
import containerPlugin from 'markdown-it-container';
import titlePlugin from './markdown-it-title.mjs';
import markdownPlugin from './markdown-it-markdown.mjs';
import containerPluginOption from './markdown-it-container-option.mjs';
import slugify from '@sindresorhus/slugify';
import type { Options } from 'vite-plugin-svelte-md';
import { createTwoslasher as createTwoslasherESLint } from 'twoslash-eslint';
import Shiki from '@shikijs/markdown-it';
import plugin from 'eslint-plugin-svelte';
import { transformerTwoslash } from '@shikijs/twoslash';

const shikiPlugin = await Shiki({
	theme: 'dark-plus',
	// Or any other integrations that support passing Shiki transformers
	transformers: [
		// Create another transformer, but with different trigger and ESLint twoslasher
		transformerTwoslash({
			filter(lang, code) {
				if (lang.startsWith('svelte') || lang.startsWith('js')) {
					return /\/\*\s*eslint/.test(code);
				}
				return false;
			},
			explicitTrigger: false,
			// Pass the custom twoslasher
			twoslasher: createTwoslasherESLint({
				eslintConfig: [...plugin.configs['flat/base']],
				includeDocs: false
			}),
			rendererRich: {
				errorRendering: 'hover'
			}
		})
	]
});

export default (options: { baseUrl: string; root: string }): Options => ({
	wrapperClasses: [],
	markdownItOptions: {
		highlight
	},
	markdownItUses: [
		[
			replaceLinkPlugin,
			{
				baseUrl: options.baseUrl,
				root: options.root
			}
		],
		emojiPlugin,
		[
			anchorPlugin,
			{
				slugify,
				permalink: anchorPlugin.permalink.linkInsideHeader({
					symbol: '#',
					placement: 'before'
				})
			}
		],
		titlePlugin,
		markdownPlugin,
		[containerPlugin, 'tip', containerPluginOption('tip')],
		[containerPlugin, 'warning', containerPluginOption('warning')],
		[containerPlugin, 'danger', containerPluginOption('danger', 'warning')],
		[containerPlugin, 'details', containerPluginOption('details')],
		shikiPlugin
	]
});
