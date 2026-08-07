<script>
	import Header from '$lib/header/Header.svelte';
	import SideMenu from '$lib/sidemenu/SideMenu.svelte';
	import TableOfContents from '$lib/toc/TableOfContents.svelte';
	import CodeBlockEnhancer from '$lib/code/CodeBlockEnhancer.svelte';
	import RulesExplorer from '$lib/rules/RulesExplorer.svelte';
	import Footer from '$lib/footer/Footer.svelte';
	import { page } from '$app/stores';
	import { stripBaseUrl, tocStore } from '$lib/utils.js';

	import '../reset.css';
	import '../app.css';

	/** @type {import('./$types').PageData} */
	export let data;

	$: ({ moduleData } = data);
	$: frontmatter = moduleData.frontmatter || {};
	$: fileInfo = moduleData.fileInfo || {};
	$: toc = moduleData.toc || { children: [] };
	$: $tocStore = toc;
	$: hasPageHeading = toc.children?.some((item) => item.level === 1);
	$: isRulesIndex = stripBaseUrl($page.url.pathname).replace(/\/$/u, '') === '/rules';

	let sidebarOpen = false;

	function resetSidebarOpen() {
		sidebarOpen = false;
	}
</script>

<svelte:window on:resize={sidebarOpen ? resetSidebarOpen : null} />

<Header bind:sidebarOpen on:toggleSidebarOpen={() => (sidebarOpen = !sidebarOpen)} />
<SideMenu {sidebarOpen} hiddenMenu={frontmatter.hiddenMenu} />

{#if sidebarOpen}
	<button
		class="sidebar-backdrop"
		type="button"
		on:click={resetSidebarOpen}
		aria-label="Close navigation"
	></button>
{/if}

<main
	class:hidden-menu={frontmatter.hiddenMenu}
	class:rules-index={isRulesIndex}
	class:without-toc={isRulesIndex}
	class={frontmatter.pageClass || ''}
>
	<article class="main-content">
		{#if frontmatter.title && !hasPageHeading && !isRulesIndex}
			<p class="page-kicker">Official Svelte ESLint plugin</p>
			<h1 class="page-title">{frontmatter.title}</h1>
		{/if}
		{#if isRulesIndex}
			<RulesExplorer />
		{:else}
			<slot />
		{/if}
		{#if !frontmatter.hideFooter}
			<Footer {frontmatter} {fileInfo} />
		{/if}
	</article>
</main>

{#if !frontmatter.hiddenMenu && !isRulesIndex}
	<TableOfContents />
{/if}

<CodeBlockEnhancer />

<style>
	main {
		min-height: 100vh;
		padding-top: var(--header-height);
	}

	main:not(.hidden-menu) {
		padding-left: var(--sidebar-width);
		padding-right: var(--toc-width);
	}

	main.without-toc {
		padding-right: 0;
	}

	.main-content {
		width: min(100%, var(--content-width));
		margin: 0 auto;
		padding: 3.5rem 2.5rem 2rem;
	}

	.rules-index .main-content {
		width: min(100%, 66rem);
	}

	.page-kicker {
		margin: 0 0 0.65rem;
		color: var(--accent);
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.page-title {
		margin-bottom: 1.5rem;
		font-size: clamp(2.3rem, 6vw, 3.5rem);
		letter-spacing: -0.05em;
	}

	.sidebar-backdrop {
		position: fixed;
		inset: var(--header-height) 0 0;
		z-index: 40;
		background: rgb(15 23 42 / 0.28);
		backdrop-filter: blur(2px);
	}

	@media (max-width: 1279px) {
		main:not(.hidden-menu) {
			padding-right: 0;
		}
	}

	@media (max-width: 900px) {
		main:not(.hidden-menu) {
			padding-left: 0;
		}
		.main-content {
			padding: 2.75rem 1.5rem 1.5rem;
		}
	}

	@media (max-width: 560px) {
		.main-content {
			padding: 2.25rem 1.1rem 1rem;
		}
	}
</style>
