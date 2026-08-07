<script>
	import UlMenu from './UlMenu.svelte';
	import { menuItems } from '../utils.js';

	export let sidebarOpen = false;
	export let hiddenMenu = false;
</script>

{#if !hiddenMenu || sidebarOpen}
	<aside class:sidebar-open={sidebarOpen} aria-label="Documentation navigation">
		<div class="sidebar-heading">
			<span>Documentation</span>
			<span class="version">v3</span>
		</div>
		<UlMenu children={$menuItems} />
	</aside>
{/if}

<style>
	aside {
		position: fixed;
		top: var(--header-height);
		bottom: 0;
		left: max(0px, calc((100vw - 96rem) / 2));
		z-index: 50;
		width: var(--sidebar-width);
		overflow-y: auto;
		padding: 1.5rem 1rem 3rem;
		border-right: 1px solid var(--border);
		background: var(--surface);
		scrollbar-width: thin;
		scrollbar-color: var(--border-strong) transparent;
	}

	.sidebar-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0.35rem 1rem;
		color: var(--text-faint);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.version {
		padding: 0.08rem 0.3rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 0.6rem;
		letter-spacing: 0;
	}

	@media (max-width: 1535px) {
		aside {
			left: 0;
		}
	}

	@media (max-width: 900px) {
		aside {
			z-index: 90;
			width: min(var(--sidebar-width), 86vw);
			box-shadow: 14px 0 40px rgb(15 23 42 / 0.12);
			transform: translateX(-105%);
			transition: transform 180ms ease;
		}

		aside.sidebar-open {
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		aside {
			transition: none;
		}
	}
</style>
