<script>
	const one = new URL('https://svelte.dev');
	const two = new URL('/blog', 'https://svelte.dev');
</script>

<a href={one.toString()}>One</a>
<a href={two.toString()}>Two</a>
<a href={new URL('https://svelte.dev').toString()}>Three</a>
