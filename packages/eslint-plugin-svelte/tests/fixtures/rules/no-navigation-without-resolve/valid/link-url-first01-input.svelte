<script>
	const one = new URL('https://svelte.dev');
	const two = new URL('/blog', 'https://svelte.dev');
</script>

<a href={one.href + '?x=1'}>One</a>
<a href={`${two}/post`}>Two</a>
<a href={one.toString() + '/blog' + '?x=1'}>Three</a>
<a href={`${String(two)}#section`}>Four</a>
