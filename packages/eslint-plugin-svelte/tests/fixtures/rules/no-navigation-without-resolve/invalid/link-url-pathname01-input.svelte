<script>
	const one = new URL('https://svelte.dev/blog');
</script>

<a href={one.pathname}>One</a>
<a href={one.pathname + one.search}>Two</a>
