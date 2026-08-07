<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { markdownPath, menuItems, isActive } from '../utils.js';

	export let fileInfo = {};
	export let frontmatter = {};

	let prev, next;
	$: {
		prev = undefined;
		next = undefined;
		let prevItem;
		let currentFound = false;
		for (const item of iterateMenuItem($menuItems)) {
			if (!item.path) continue;
			if (currentFound) {
				next = item;
				break;
			}
			if (isActive(item.path, $page)) {
				prev = prevItem;
				currentFound = true;
			} else {
				prevItem = item;
			}
		}
	}

	function* iterateMenuItem(children) {
		for (const item of children) {
			yield item;
			if (item.children?.length) yield* iterateMenuItem(item.children);
		}
	}
</script>

<footer class:hidden-menu={frontmatter.hiddenMenu}>
	<div class="page-meta">
		<a
			href="https://github.com/sveltejs/eslint-plugin-svelte/edit/main/docs/{markdownPath(
				$page.url.pathname
			)}"
			target="_blank"
			rel="noopener noreferrer"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"></path></svg
			>
			Edit this page
		</a>
		{#if fileInfo.lastUpdated}
			<span>Last updated {fileInfo.lastUpdated}</span>
		{/if}
	</div>

	{#if prev || next}
		<nav aria-label="Previous and next pages">
			{#if prev}
				<a class="prev" href={resolve(prev.path)}>
					<span>Previous</span>
					<strong><span aria-hidden="true">←</span> {prev.title}</strong>
				</a>
			{/if}
			{#if next}
				<a class="next" href={resolve(next.path)}>
					<span>Next</span>
					<strong>{next.title} <span aria-hidden="true">→</span></strong>
				</a>
			{/if}
		</nav>
	{/if}

	<p>
		Released under the <a href="https://github.com/sveltejs/eslint-plugin-svelte/blob/main/LICENSE"
			>MIT License</a
		>.
	</p>
</footer>

<style>
	footer {
		margin-top: 4.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border);
	}

	.page-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--text-faint);
		font-size: 0.72rem;
	}

	.page-meta a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-muted);
		font-weight: 600;
		text-decoration: none;
	}

	.page-meta a:hover {
		color: var(--accent);
	}

	.page-meta svg {
		width: 0.9rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	nav {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 2rem;
	}

	nav a {
		display: flex;
		min-height: 5.25rem;
		justify-content: center;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		text-decoration: none;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease,
			transform 120ms ease;
	}

	nav a:hover {
		border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
		box-shadow: 0 5px 18px rgb(15 23 42 / 0.06);
		transform: translateY(-1px);
	}

	nav a.next {
		grid-column: 2;
		text-align: right;
	}

	nav a > span {
		color: var(--text-faint);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	nav strong {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text);
		font-size: 0.8rem;
		font-weight: 550;
	}

	nav strong span {
		color: var(--accent);
		line-height: 1;
	}

	nav .next strong {
		justify-content: flex-end;
	}

	footer > p {
		margin: 2rem 0 0;
		color: var(--text-faint);
		font-size: 0.68rem;
		text-align: center;
	}

	footer > p a {
		color: var(--text-muted);
	}

	@media (max-width: 560px) {
		.page-meta {
			align-items: flex-start;
			flex-direction: column;
		}
		nav {
			grid-template-columns: 1fr;
		}
		nav a.next {
			grid-column: 1;
		}
	}
</style>
