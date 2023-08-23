<script>
	import { page } from '$app/stores';
	import { markdownPath, menuItems, isActive } from '../utils.js';
	import { base as baseUrl } from '$app/paths';
	export let fileInfo = {};
	export let frontmatter = {};

	let prev, next;
	$: {
		let prevItem, currItem;
		for (const item of iterateMenuItem($menuItems)) {
			if (!item.path) {
				continue;
			}
			if (currItem) {
				next = item;
				break;
			}
			if (isActive(item.path, $page)) {
				prev = prevItem;
				currItem = item;
				continue;
			}
			prevItem = item;
		}
	}

	/** Iterate */
	function* iterateMenuItem(children) {
		for (const item of children) {
			yield item;

			if (item.children && item.children.length) {
				yield* iterateMenuItem(item.children);
			}
		}
	}
</script>

<footer class:hidden-menu={frontmatter.hiddenMenu}>
	<div class="footer-tools">
		<div class="edit-link">
			<a
				href="https://github.com/sveltejs/eslint-plugin-svelte/edit/main/docs/{markdownPath(
					$page.url.pathname
				)}"
				target="_blank"
				rel="noopener noreferrer">Edit this page</a
			>
			<span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					focusable="false"
					x="0px"
					y="0px"
					viewBox="0 0 100 100"
					width="15"
					height="15"
					class="icon outbound"
					><path
						fill="currentColor"
						d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
					/>
					<polygon
						fill="currentColor"
						points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
					/>
				</svg>
			</span>
		</div>
		{#if fileInfo.lastUpdated}
			<div class="last-updated">
				<span class="prefix">Last Updated:</span>
				<span class="time">{fileInfo.lastUpdated}</span>
			</div>
		{/if}
	</div>
	<div class="footer-move">
		{#if prev}
			<span class="prev">←<a href="{baseUrl}{prev.path}">{prev.title}</a></span>
		{/if}
		{#if next}
			<span class="next"><a href="{baseUrl}{next.path}">{next.title}</a>→ </span>
		{/if}
	</div>
	<div class="footer-text">
		<span
			>This site was built with <a href="https://kit.svelte.dev/" target="_brank">SvelteKit</a
			>.</span
		>
	</div>
</footer>

<style>
	.footer-tools {
		width: 100%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
	}
	.footer-move {
		border-top: 1px solid var(--background-without-opacity);
		width: 100%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
	}
	.footer-text {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.last-updated,
	.next {
		margin-left: auto;
	}

	footer:not(.hidden-menu) {
		padding-left: 20rem;
	}

	@media (max-width: 959px) {
		footer:not(.hidden-menu) {
			padding-left: 16.4rem;
		}
	}
	@media (max-width: 719px) {
		footer:not(.hidden-menu) {
			padding-left: 0;
		}
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
