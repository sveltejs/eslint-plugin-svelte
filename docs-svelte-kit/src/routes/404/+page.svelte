<script>
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Page not found | eslint-plugin-svelte</title>
	<meta
		name="description"
		content="The requested eslint-plugin-svelte documentation page was not found."
	/>
</svelte:head>

<section class="error-page">
	<p class="error-code">404</p>
	<h1>Page not found</h1>
	<p>The documentation page you requested does not exist or may have moved.</p>
	<a href={resolve('/')}>Return to the documentation</a>
</section>

<style>
	.error-page {
		display: flex;
		min-height: calc(100vh - var(--header-height) - 8rem);
		align-items: center;
		justify-content: center;
		flex-direction: column;
		text-align: center;
	}

	.error-code {
		margin: 0 0 0.6rem;
		color: var(--accent);
		font: 600 0.78rem/1 var(--font-mono);
		letter-spacing: 0.12em;
	}

	h1 {
		margin-bottom: 0.85rem;
	}

	.error-page > p:not(.error-code) {
		max-width: 30rem;
		margin: 0;
	}

	a {
		margin-top: 1.5rem;
		padding: 0.65rem 0.9rem;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface-muted);
		color: var(--text);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
	}

	a:hover {
		border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
		color: var(--accent-strong);
		text-align: center;
	}
</style>
