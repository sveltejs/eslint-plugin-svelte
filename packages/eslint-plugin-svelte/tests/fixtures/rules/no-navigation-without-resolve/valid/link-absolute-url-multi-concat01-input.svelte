<script>
	const host = 'example.com';
	const path = '/foo';
</script>

<a href={'https://' + host + '/foo'}>Click me!</a>
<a href={`https://${host}` + path}>Click me!</a>
<a href={'https://example.com' + path + '?bar=baz'}>Click me!</a>
