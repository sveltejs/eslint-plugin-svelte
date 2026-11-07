<script>
	const one = new URL('https://svelte.dev');
	const two = new URL('/blog', 'https://svelte.dev');
</script>

<a href={one}>One</a>
<a href={two}>Two</a>
<a href={new URL('https://svelte.dev')}>Three</a>
