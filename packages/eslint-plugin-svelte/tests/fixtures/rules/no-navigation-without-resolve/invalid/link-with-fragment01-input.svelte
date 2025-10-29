<script>
	const value = "/foo#section";
	const href = "/foo#section";
</script>

<a href="/foo#section">Click me!</a>
<a href={'/foo#section'}>Click me!</a>
<a href={'/' + 'foo#section'}>Click me!</a>
<a href={value}>Click me!</a>
<a {href}>Click me!</a>
<a href={'/foo#section:42'}>Click me!</a>
