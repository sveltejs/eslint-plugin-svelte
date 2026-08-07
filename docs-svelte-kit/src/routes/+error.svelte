<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status}: {$page.error.message} | eslint-plugin-svelte</title>
</svelte:head>

<section class="error-page">
	<p class="error-code">{$page.status}</p>
	<h1>{$page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
	<p>{$page.error.message}</p>
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
	}
</style>
