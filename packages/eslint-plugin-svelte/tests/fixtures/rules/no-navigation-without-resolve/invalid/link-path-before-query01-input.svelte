<script>
	const qs = '?q=1';
	const section = '#section';
</script>

<a href={`/search${qs}`}>Click me!</a>
<a href={'/search' + section}>Click me!</a>
<a href="/search{qs}">Click me!</a>
