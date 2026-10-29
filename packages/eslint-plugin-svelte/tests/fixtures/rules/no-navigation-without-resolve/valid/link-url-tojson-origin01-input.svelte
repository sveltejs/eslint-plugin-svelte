<script>
	const one = new URL('https://svelte.dev');
	const two = new URL('/blog', 'https://svelte.dev');
</script>

<a href={one.toJSON()}>One</a>
<a href={two.origin}>Two</a>
