/* globals RULES_META -- ignore */
import { readable, writable } from 'svelte/store';
import { page } from '$app/stores';
import { base as baseUrl } from '$app/paths';

const rules = RULES_META;

export function stripBaseUrl(path) {
	const docsBase = baseUrl || '/eslint-plugin-svelte';
	if (path.startsWith(docsBase)) {
		return path.slice(docsBase.length);
	}
	return path;
}

const svelteRules = rules.filter((rule) => !rule.meta.deprecated);

export const searchItems = [
	{
		title: 'Introduction',
		description: 'What eslint-plugin-svelte is and how it helps you lint Svelte applications.',
		section: 'Documentation',
		path: '/',
		keywords: 'home getting started overview'
	},
	{
		title: 'User Guide',
		description: 'Install and configure ESLint for Svelte, SvelteKit, and TypeScript projects.',
		section: 'Documentation',
		path: '/user-guide/',
		keywords: 'install setup configuration typescript editor vscode'
	},
	{
		title: 'Available Rules',
		description: 'Browse every lint rule provided by eslint-plugin-svelte.',
		section: 'Reference',
		path: '/rules/',
		keywords: 'rules reference recommended'
	},
	{
		title: 'Migration',
		description: 'Upgrade from earlier versions of eslint-plugin-svelte.',
		section: 'Documentation',
		path: '/migration/',
		keywords: 'upgrade migrate legacy'
	},
	...svelteRules.map((rule) => ({
		title: rule.meta.docs.ruleId,
		description: rule.meta.docs.description.replaceAll('`', ''),
		section: rule.meta.docs.category,
		path: `/rules/${rule.meta.docs.ruleName}/`,
		keywords: `${rule.meta.docs.ruleName} ${rule.meta.docs.recommended ? 'recommended' : ''}`
	}))
];

const categories = [
	'Possible Errors',
	'Security Vulnerability',
	'Best Practices',
	'Stylistic Issues',
	'Extension Rules',
	'SvelteKit',
	'Experimental',
	'System'
];
svelteRules.forEach((rule) => {
	if (!categories.includes(rule.meta.docs.category)) {
		throw new Error(`missing categories:${rule.meta.docs.category}`);
	}
});

const categoryRules = categories.map((cat) => {
	return {
		title: cat,
		children: svelteRules
			.filter((rule) => rule.meta.docs.category === cat)
			.map((rule) => {
				return {
					title: rule.meta.docs.ruleId,
					path: `/rules/${rule.meta.docs.ruleName}/`
				};
			})
	};
});

export const ruleCategories = categories;
export const ruleCatalog = svelteRules.map((rule) => ({
	title: rule.meta.docs.ruleId,
	description: rule.meta.docs.description.replaceAll('`', ''),
	category: rule.meta.docs.category,
	path: `/rules/${rule.meta.docs.ruleName}/`,
	recommended: rule.meta.docs.recommended === true,
	base: rule.meta.docs.recommended === 'base',
	fixable: Boolean(rule.meta.fixable),
	hasSuggestions: Boolean(rule.meta.hasSuggestions)
}));
const SIDE_MENU = {
	'/rules': [
		{ path: '/', title: 'Introduction' },
		{ path: '/user-guide/', title: 'User Guide' },
		{
			path: '/rules/',
			title: 'Available Rules',
			children: categoryRules
		},
		{ path: '/migration/', title: 'Migration' }
	],
	'/': [
		{ path: '/', title: 'Introduction' },
		{ path: '/user-guide/', title: 'User Guide' },
		{ path: '/rules/', title: 'Available Rules' },
		{ path: '/migration/', title: 'Migration' }
	]
};

export function isActive(path, $page) {
	return markdownPath($page.url.pathname) === markdownPath(path);
}

export function markdownPath(path) {
	// eslint-disable-next-line no-param-reassign -- ignore
	path = stripBaseUrl(path);

	let normalized = !path.trim() || path === '/' ? 'README' : path.replace(/^\/|\/$/g, '');
	return `${normalized}.md`;
}

export const tocStore = writable({ children: [] });

export const menuItems = readable([], function start(set) {
	let pageData = {};
	let tocData = { children: [] };
	const pageUnsubscriber = page.subscribe(($page) => {
		pageData = $page;
		set(generateMenu(pageData, tocData));
	});
	const tocUnsubscriber = tocStore.subscribe((toc) => {
		tocData = toc;
		set(generateMenu(pageData, tocData));
	});

	return function stop() {
		pageUnsubscriber();
		tocUnsubscriber();
	};
});

function generateMenu($page, toc) {
	const result = [];
	const [, menus] = Object.entries(SIDE_MENU).find(([k]) =>
		stripBaseUrl($page.url.pathname).startsWith(k)
	) || ['/', SIDE_MENU['/']];
	for (const { path, title, children } of menus) {
		const active = isActive(path, $page);
		if (active) {
			for (const item of toc.children) {
				result.push({
					...item,
					path,
					title,
					children: children || item.children
				});
			}
		} else {
			result.push({ path, title, children });
		}
	}

	return result;
}
