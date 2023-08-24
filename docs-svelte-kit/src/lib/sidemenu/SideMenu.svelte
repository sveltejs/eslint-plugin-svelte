<script>
	import UlMenu from './UlMenu.svelte';
	import { menuItems } from '../utils.js';

	export let sidebarOpen = false;
	export let hiddenMenu = false;
</script>

{#if !hiddenMenu || sidebarOpen}
	<aside class:sidebar-open={sidebarOpen}>
		<UlMenu children={$menuItems} />
	</aside>
{/if}

<style>
	aside {
		font-size: 16px;
		width: 20rem;
		position: fixed;
		z-index: 10;
		margin: 0;
		top: 3.6rem;
		left: 0;
		bottom: 0;
		box-sizing: border-box;
		border-right: 1px solid var(--background-without-opacity);
		overflow-y: auto;
		background-color: var(--secondary-color);
	}

	@media (max-width: 959px) {
		aside {
			font-size: 15px;
			width: 16.4rem;
		}
	}
	@media (max-width: 719px) {
		aside {
			top: 0;
			padding-top: 3.6rem;
			transform: translateX(-100%);
			transition: transform 0.2s ease;
		}
		aside.sidebar-open {
			transform: translateX(0);
		}
	}
</style>
