<script>
	import { page } from '$app/stores';
	import { isActive, stripBaseUrl } from '../utils.js';
	import { base as baseUrl } from '$app/paths';
	export let children;
	export let level = 1;
</script>

<ul class="sidebar-menu sidebar-menu--level{level}">
	{#each children as item}
		<li
			class="sidebar-menu-item"
			class:active={item.active || (item.path && isActive(item.path, $page))}
		>
			{#if item.path || item.id}
				<a
					class="sidebar-menu-item-title"
					class:active={item.active || (item.path && isActive(item.path, $page))}
					href="{baseUrl}{item.path || `${stripBaseUrl($page.url.pathname)}#${item.id}`}"
					>{item.title}</a
				>
			{:else}
				<span class="sidebar-menu-item-title">{item.title}</span>
			{/if}
			{#if item.children && item.children.length}
				<svelte:self children={item.children} level={level + 1} />
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		padding: 0;
		margin: 0;
		list-style-type: none;
	}

	ul.sidebar-menu--level1 > li > a {
		font-size: 1.1em;
		line-height: 1.7;
		font-weight: 700;
		padding: 0.35rem 1rem 0.35rem 1.25rem;
	}
	ul.sidebar-menu--level1 {
		padding: 2.4rem 0;
	}
	ul:not(.sidebar-menu--level1) {
		padding-left: 1rem;
		font-size: 0.95em;
	}
	.sidebar-menu-item,
	.sidebar-menu-item-title {
		color: white;
	}
	.sidebar-menu-item-title {
		padding: 0.25rem 1rem 0.25rem 1.25rem;
		font-size: 1em;
		font-weight: 400;
		display: inline-block;
		line-height: 1.4;
		width: 100%;
		box-sizing: border-box;
		border-left: 0.25rem solid transparent;
	}

	/* active menu */
	.sidebar-menu-item-title {
		position: relative;
	}
	.sidebar-menu-item-title.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: calc(50% - var(--size));
		right: 0;
		border: var(--size) solid transparent;
		border-right: var(--size) solid white;
	}
	a.sidebar-menu-item-title:not(.active) {
		transition: color 0.2s linear;
	}
	a.sidebar-menu-item-title:not(.active):hover {
		color: #40b3ff;
	}
</style>
