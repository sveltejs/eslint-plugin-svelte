<script>
	const one = new URL('https://svelte.dev');
	const two = new URL('/blog', 'https://svelte.dev');
</script>

<a href={one.href}>One</a>
<a href={two.href}>Two</a>
<a href={new URL('https://svelte.dev').href}>Three</a>
