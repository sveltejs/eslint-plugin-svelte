<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { isActive, stripBaseUrl } from '../utils.js';

	export let children;
	export let level = 1;

	function hasActiveDescendant(item) {
		return item.children?.some(
			(child) => (child.path && isActive(child.path, $page)) || hasActiveDescendant(child)
		);
	}
</script>

<ul class="sidebar-menu level-{level}">
	{#each children as item (item.path || item.id || item.title)}
		<li class:active={item.active || (item.path && isActive(item.path, $page))}>
			{#if item.path || item.id}
				<a
					class:active={item.active || (item.path && isActive(item.path, $page))}
					class:expanded={item.children?.length}
					href={resolve(item.path || `${stripBaseUrl($page.url.pathname)}#${item.id}`)}
				>
					<span>{item.title}</span>
					{#if level === 1}<svg viewBox="0 0 20 20" aria-hidden="true"
							><path d="m8 5 5 5-5 5"></path></svg
						>{/if}
				</a>
			{:else if item.children?.length}
				<details open={hasActiveDescendant(item)}>
					<summary>
						<span>{item.title}</span>
						<span class="group-count">{item.children.length}</span>
						<svg class="group-chevron" viewBox="0 0 20 20" aria-hidden="true">
							<path d="m8 5 5 5-5 5"></path>
						</svg>
					</summary>
					<svelte:self children={item.children} level={level + 1} />
				</details>
			{:else}
				<span class="group-title">{item.title}</span>
			{/if}
			{#if (item.path || item.id) && item.children?.length}
				<svelte:self children={item.children} level={level + 1} />
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.level-1 {
		margin-top: 0.65rem;
	}

	.level-1 > li {
		margin-bottom: 0.15rem;
	}

	a {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.4rem;
		padding: 0.44rem 0.65rem;
		border-radius: 7px;
		color: var(--text-muted);
		font-size: 0.78rem;
		line-height: 1.35;
		text-decoration: none;
		transition:
			color 120ms ease,
			background 120ms ease;
	}

	a:hover {
		background: var(--surface-muted);
		color: var(--text);
	}

	a.active {
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-weight: 550;
	}

	a span {
		min-width: 0;
		flex: 1;
		overflow-wrap: anywhere;
	}

	a svg {
		width: 0.8rem;
		flex: 0 0 auto;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
		opacity: 0.55;
		transition: transform 120ms ease;
	}

	a.expanded svg {
		transform: rotate(90deg);
	}

	.level-2 {
		margin: 0.2rem 0 0.75rem;
		padding-left: 0.5rem;
		border-left: 1px solid var(--border);
	}

	.level-2 a,
	.level-3 a {
		padding-top: 0.34rem;
		padding-bottom: 0.34rem;
		font-size: 0.73rem;
	}

	.level-3 {
		margin: 0.2rem 0 0.65rem;
	}

	.group-title {
		display: block;
		padding: 0.8rem 0.65rem 0.28rem;
		color: var(--text-faint);
		font-size: 0.64rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	details {
		margin: 0.15rem 0;
	}

	summary {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.48rem 0.65rem;
		border-radius: 6px;
		color: var(--text-faint);
		font-size: 0.63rem;
		font-weight: 600;
		letter-spacing: 0.065em;
		list-style: none;
		text-transform: uppercase;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover {
		background: var(--surface-muted);
		color: var(--text-muted);
	}

	summary > span:first-child {
		min-width: 0;
		flex: 1;
	}

	.group-count {
		font-size: 0.56rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
	}

	.group-chevron {
		width: 0.68rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
		transition: transform 120ms ease;
	}

	details[open] > summary .group-chevron {
		transform: rotate(90deg);
	}

	details > .level-3 {
		margin: 0.15rem 0 0.65rem;
		padding-left: 0.35rem;
		border-left: 1px solid var(--border);
	}
</style>
