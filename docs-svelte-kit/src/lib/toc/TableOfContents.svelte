<script>
	import { tocStore } from '../utils.js';

	$: items = flattenToc($tocStore.children || []).filter((item) => item.level > 1);

	function flattenToc(children, result = []) {
		for (const item of children) {
			result.push(item);
			if (item.children?.length) flattenToc(item.children, result);
		}
		return result;
	}
</script>

{#if items.length}
	<aside aria-label="On this page">
		<p>On this page</p>
		<nav>
			{#each items as item (item.id)}
				<a class:child={item.level > 2} href={`#${item.id}`}>{item.title}</a>
			{/each}
		</nav>
		<div class="toc-links">
			<a
				href="https://github.com/sveltejs/eslint-plugin-svelte/issues/new"
				target="_blank"
				rel="noopener noreferrer">Report an issue <span aria-hidden="true">↗</span></a
			>
		</div>
	</aside>
{/if}

<style>
	aside {
		position: fixed;
		top: 6.75rem;
		right: max(1.5rem, calc((100vw - 92rem) / 2));
		width: 12.5rem;
		max-height: calc(100vh - 8.25rem);
		overflow-y: auto;
		padding-left: 1.25rem;
		border-left: 1px solid var(--border);
	}

	p {
		margin: 0 0 0.75rem;
		color: var(--text);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	nav a,
	.toc-links a {
		color: var(--text-muted);
		font-size: 0.75rem;
		line-height: 1.35;
		text-decoration: none;
		transition: color 120ms ease;
	}

	nav a:hover,
	.toc-links a:hover {
		color: var(--accent);
	}

	nav a.child {
		padding-left: 0.7rem;
	}

	.toc-links {
		margin-top: 1.2rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--border);
	}

	.toc-links span {
		display: inline-block;
		margin-left: 0.12rem;
		font-size: 0.7rem;
		line-height: 1;
		transform: translateY(-0.06em);
	}

	@media (max-width: 1279px) {
		aside {
			display: none;
		}
	}
</style>
