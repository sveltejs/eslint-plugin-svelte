<script>
	const value = "/foo#section";
</script>

<a href="/foo#section">Click me!</a>
<a href={'/foo#section'}>Click me!</a>
<a href={'/' + 'foo#section'}>Click me!</a>
<a href={value}>Click me!</a>
