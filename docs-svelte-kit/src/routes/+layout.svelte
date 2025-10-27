<script>
	import Header from '$lib/header/Header.svelte';
	import SideMenu from '$lib/sidemenu/SideMenu.svelte';
	import Footer from '$lib/footer/Footer.svelte';

	import '../reset.css';
	import '../app.css';
	import { tocStore } from '$lib/utils.js';

	/** @type {import('./$types').PageData */
	export let data;
	$: ({ moduleData } = data);
	$: frontmatter = moduleData.frontmatter;
	$: fileInfo = moduleData.fileInfo;
	$: {
		const toc = moduleData.toc;
		$tocStore = toc;
	}

	let sidebarOpen = false;

	function handleToggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
	function resetSidebarOpen() {
		sidebarOpen = false;
	}
</script>

<svelte:window on:resize={sidebarOpen ? resetSidebarOpen : null} />

<Header on:toggleSidebarOpen={handleToggleSidebar} />

<SideMenu {sidebarOpen} hiddenMenu={frontmatter.hiddenMenu} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main
	class:hidden-menu={frontmatter.hiddenMenu}
	on:click={sidebarOpen ? resetSidebarOpen : null}
	on:keydown={sidebarOpen ? resetSidebarOpen : null}
>
	<div class="main-content">
		<slot />
	</div>
</main>

<Footer {frontmatter} {fileInfo} />

<style>
	main {
		margin-top: 64px;
		min-height: calc(100vh - 180px);
	}
	main:not(.hidden-menu) {
		padding-left: 20rem;
	}

	@media (max-width: 959px) {
		main:not(.hidden-menu) {
			padding-left: 16.4rem;
		}
	}
	@media (max-width: 719px) {
		main:not(.hidden-menu) {
			padding-left: 0;
		}
	}

	main .main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem calc(1rem + 16px);
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.main-content :global(:where(li)) {
		margin: 0 0 0.5em;
		line-height: 1.5;
		position: relative;
	}

	.main-content :global(:where(ul li):before) {
		--sk-back-5: #c2cdd6;
		content: '';
		background-color: var(--sk-back-5);
		opacity: 0.7;
		border-radius: 2px;
		width: 6px;
		height: 6px;
		margin-top: 8px;
		margin-left: -18px;
		position: absolute;
	}
</style>
