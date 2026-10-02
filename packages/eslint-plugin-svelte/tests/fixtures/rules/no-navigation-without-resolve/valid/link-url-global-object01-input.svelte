<script>
	const one = new globalThis.URL('https://svelte.dev');
	const two = new window.URL('/blog', 'https://svelte.dev');
</script>

<a href={one.href}>One</a>
<a href={two}>Two</a>
<a href={new globalThis.URL('https://svelte.dev')}>Three</a>
